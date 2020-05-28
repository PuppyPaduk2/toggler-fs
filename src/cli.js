#!/usr/bin/env node

const { program } = require("commander");
const path = require("path");
const fs = require("fs");
const objectHash = require("object-hash");

const { version } = require("../package.json");

// Main programm
program.version(version);

// Command 'add'
const add = program.command("add <files>");

add.action((...args) => {
  commandAdd(...args);
});

// Command 'show'
const show = program.command("show");

show.action((...args) => {
  commandShow(...args);
});

// Command 'hide'
const hide = program.command("hide");

hide.action((...args) => {
  commandHide(...args);
});

// Command Remove
const clear = program.command("clear");

clear.action((...args) => {
  commandClear(...args);
});

program.parse(process.argv);

// Commands
async function commandAdd(_, command) {
  const title = "✨ toggler-fs add done";

  console.time(title);

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

  console.timeEnd(title);
}

async function commandShow() {
  const title = "✨ toggler-fs show done";

  console.time(title);

  await copyPath(getPathStore(), process.cwd());

  console.timeEnd(title);
}

async function commandHide() {
  const title = "✨ toggler-fs hide done";

  console.time(title);

  hidePath(getPathStore(), process.cwd());

  console.timeEnd(title);
}

async function commandClear() {
  const title = "✨ toggler-fs clear done";

  console.time(title);

  removePath(getPathStore(), process.cwd());

  console.timeEnd(title);
}

// Addded methods
function getPathStore() {
  const pathRootStore = path.resolve(__dirname, "../.store");
  const keyStore = objectHash(process.cwd());

  return path.resolve(pathRootStore, keyStore);
}

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

function nodePromise(callback, ...args) {
  return new Promise((resolve, reject) => {
    callback(...args, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });
}

async function asyncForEach(arr, callback) {
  for (let index = 0; index < arr.length; index += 1) {
    await callback(arr[index], index, arr);
  }
}
