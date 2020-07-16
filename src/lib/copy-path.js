const { nodePromise } = require("./node-promise");
const fs = require("fs");
const { mkDir } = require("./mk-dir");
const path = require("path");
const { asyncForEach } = require("./async-for-each");

async function copyFile(pathFrom, pathTo) {
  await mkDir(path.dirname(pathTo));

  return nodePromise(fs.copyFile, [pathFrom, pathTo]);
}

async function copyPath(pathFrom, pathTo) {
  const fromStat = await nodePromise(fs.stat, [pathFrom]);

  if (fromStat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, [pathFrom]);

    await asyncForEach(dirPaths, async (item) => {
      await copyPath(path.resolve(pathFrom, item), path.resolve(pathTo, item));
    });

    return;
  }

  await copyFile(pathFrom, pathTo);
}

module.exports = { copyFile, copyPath };
