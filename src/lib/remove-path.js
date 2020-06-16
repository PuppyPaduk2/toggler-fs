const fs = require("fs");
const path = require("path");
const { nodePromise } = require("./node-promise");
const { asyncForEach } = require("./async-for-each");

async function removePath(pathDir) {
  const stat = await nodePromise(fs.stat, pathDir);

  if (stat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, pathDir);

    await asyncForEach(
      dirPaths,
      async (item) => await removePath(path.resolve(pathDir, item), true),
    );
    await nodePromise(fs.rmdir, pathDir);

    return;
  }

  try {
    await nodePromise(fs.access, pathDir);
    await nodePromise(fs.unlink, pathDir);
  } catch (error) {
    // pass
  }
}

module.exports = { removePath };
