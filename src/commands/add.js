const { getPathStore } = require("../lib/store");
const { asyncForEach } = require("../lib/async-for-each");
const { mkDir } = require("../lib/mk-dir");
const { copyPath } = require("../lib/copy-path");
const path = require("path");
const { removePath } = require("../lib/remove-path");
const fs = require("fs");
const { nodePromise } = require("../lib/node-promise");

async function commandAdd(params = {}) {
  const { files = [] } = params;
  const pathStore = await getPathStore();

  // Create dir
  await mkDir(pathStore);

  await asyncForEach(files, async (_pathFile) => {
    const pathFileFrom = path.resolve(process.cwd(), _pathFile);
    const pathFileTo = path.resolve(pathStore, _pathFile);

    console.log(`from: ${pathFileFrom}`);
    console.log(`to: ${pathFileTo}`);

    try {
      const fromStat = await nodePromise(fs.stat, pathFileFrom);
      const copyObjectName = fromStat.isDirectory() ? "directory" : "file";

      await copyPath(pathFileFrom, pathFileTo);
      await removePath(pathFileFrom);

      console.log(`✅ copy ${copyObjectName}`);
    } catch (error) {
      console.log(`⛔️ copy ${copyObjectName}`);
      console.log(error.message);
    }

    console.log("");
  });
}

module.exports = { commandAdd };
