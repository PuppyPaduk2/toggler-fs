#!/usr/bin/env node

const { program } = require("commander");
const path = require("path");
const fs = require("fs");
const objectHash = require("object-hash");
const { timeCommand } = require("./lib/time");
const { nodePromise } = require("./lib/node-promise");
const { getPathStore, getStore } = require("./lib/store");

require("colors");

const { version } = require("../package.json");

// Main programm
program.version(version);

// Command 'add'
const add = program.command("add <files>");

add.action((...args) => timeCommand("add", () => commandAdd(...args)));

// Command 'remove'
const remove = program.command("remove <hash-files>");

remove.action((...args) => timeCommand("remove", () => commandRemove(...args)));

// Command 'show'
const show = program.command("show");

show.action((...args) => timeCommand("show", () => commandShow(...args)));

// Command 'hide'
const hide = program.command("hide");

hide.action((...args) => timeCommand("hide", () => commandHide(...args)));

// Command 'clear'
const clear = program.command("clear");

clear.action((...args) => timeCommand("clear", () => commandClear(...args)));

// Command 'list'
const list = program.command("list");

list.action((...args) => timeCommand("list", () => commandList(...args)));

program.parse(process.argv);

// Commands
async function commandAdd(_, command) {
  const pathStore = getPathStore();
  const files = command.args;

  await mkdir(pathStore);

  await asyncForEach(files, async (_pathFile) => {
    const pathFileFrom = path.resolve(process.cwd(), _pathFile);
    const pathFileTo = path.resolve(pathStore, _pathFile);

    console.log("copy file");
    console.log(`from: ${pathFileFrom}`);
    console.log(`to: ${pathFileTo}`);

    try {
      await copyPath(pathFileFrom, pathFileTo);
      await removePath(pathFileFrom);

      console.log("✅ done");
    } catch (error) {
      console.log("⛔️ error");
      console.log(error.message);
    }

    console.log("");
  });
}

async function commandRemove(_, command) {
  const { pathStore } = await getStore();
  const args = command.args || [];

  const checkPath = async (_pathFile) => {
    const pathFile = _pathFile.replace(pathStore, "");

    if (pathFile.length) {
      const hashFile = objectHash(pathFile);

      if (args.includes(hashFile)) {
        await removePath(_pathFile);
      }
    }
  };

  await eachFile(pathStore, checkPath, checkPath);
}

async function commandShow() {
  await copyPath(getPathStore(), process.cwd());
}

async function commandHide() {
  hidePath(getPathStore(), process.cwd());
}

async function commandClear() {
  removePath(getPathStore(), process.cwd());
}

async function commandList() {
  const { pathStore } = await getStore();

  const logPath = ({ pre = "", post = "" }) => (_pathFile) => {
    const pathFile = _pathFile.replace(pathStore, "");

    if (pathFile.length) {
      const hashFile = objectHash(pathFile);
      console.log(`${pre}${hashFile.cyan} ${pathFile}${post}`);
    }
  };

  await eachFile(pathStore, logPath({ pre: "📄 " }), logPath({ pre: "📁 " }));
}

// Addded methods
async function lstat(path) {
  return nodePromise(fs.lstat, path);
}

async function mkdir(path) {
  try {
    await lstat(path);
  } catch (error) {
    return await nodePromise(fs.mkdir, path, { recursive: true });
  }
}

async function eachFile(
  pathValue,
  callbackFile = () => {},
  callbackDir = () => {},
) {
  const fromStat = await nodePromise(fs.stat, pathValue);

  if (fromStat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, pathValue);

    callbackDir(pathValue);

    await asyncForEach(dirPaths, async (item) => {
      await eachFile(path.resolve(pathValue, item), callbackFile, callbackDir);
    });

    return;
  }

  await callbackFile(pathValue);
}

async function copyFile(pathFrom, pathTo) {
  await mkdir(path.dirname(pathTo));

  return nodePromise(fs.copyFile, pathFrom, pathTo);
}

async function copyPath(pathFrom, pathTo) {
  const fromStat = await nodePromise(fs.stat, pathFrom);

  if (fromStat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, pathFrom);

    dirPaths.forEach((item) => {
      copyPath(path.resolve(pathFrom, item), path.resolve(pathTo, item));
    });

    return;
  }

  await copyFile(pathFrom, pathTo);
}

async function hidePath(pathFrom, pathTo, hideFolder = false) {
  const fromStat = await nodePromise(fs.stat, pathFrom);

  if (fromStat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, pathFrom);

    await asyncForEach(dirPaths, (item) =>
      hidePath(path.resolve(pathFrom, item), path.resolve(pathTo, item), true),
    );

    if (hideFolder) {
      await nodePromise(fs.rmdir, pathTo);
    }

    return;
  }

  try {
    await lstat(pathTo);
    await removeFile(pathTo);
  } catch (error) {
    // pass
  }
}

async function removePath(pathDir) {
  const stat = await nodePromise(fs.stat, pathDir);

  if (stat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, pathDir);

    await asyncForEach(dirPaths, (item) =>
      removePath(path.resolve(pathDir, item), true),
    );
    await nodePromise(fs.rmdir, pathDir);

    return;
  }

  try {
    await lstat(pathDir);
    await removeFile(pathDir);
  } catch (error) {
    // pass
  }
}

async function removeFile(path) {
  return nodePromise(fs.unlink, path);
}

async function asyncForEach(arr, callback) {
  for (let index = 0; index < arr.length; index += 1) {
    await callback(arr[index], index, arr);
  }
}
