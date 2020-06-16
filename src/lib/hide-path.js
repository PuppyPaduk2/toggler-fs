const fs = require("fs");
const path = require("path");
const { nodePromise } = require("./node-promise");
const { asyncForEach } = require("./async-for-each");

async function hidePath(pathFrom, pathTo, hideFolder = false) {
  const fromStat = await nodePromise(fs.stat, pathFrom);

  if (fromStat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, pathFrom);

    await asyncForEach(dirPaths, async (item) => {
      await hidePath(
        path.resolve(pathFrom, item),
        path.resolve(pathTo, item),
        true,
      );
    });

    if (hideFolder) {
      try {
        await nodePromise(fs.access, pathTo);
        await nodePromise(fs.rmdir, pathTo);
      } catch (error) {
        // pass
      }
    }

    return;
  }

  try {
    await nodePromise(fs.access, pathTo);
    await nodePromise(fs.unlink, pathTo);
  } catch (error) {
    // pass
  }
}

module.exports = { hidePath };
