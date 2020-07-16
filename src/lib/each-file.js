const { nodePromise } = require("./node-promise");
const { asyncForEach } = require("./async-for-each");
const fs = require("fs");
const path = require("path");

async function eachFile(
  pathValue,
  callbackFile = () => {},
  callbackDir = () => {},
) {
  const fromStat = await nodePromise(fs.stat, [pathValue]);

  if (fromStat.isDirectory()) {
    const dirPaths = await nodePromise(fs.readdir, [pathValue]);

    callbackDir(pathValue);

    await asyncForEach(dirPaths, async (item) => {
      await eachFile(path.resolve(pathValue, item), callbackFile, callbackDir);
    });

    return;
  }

  await callbackFile(pathValue);
}

module.exports = { eachFile };
