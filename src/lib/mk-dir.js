const { nodePromise } = require("./node-promise");
const fs = require("fs");

async function mkDir(path) {
  try {
    await nodePromise(fs.access, [path]);
  } catch (error) {
    nodePromise(fs.mkdir, [path, { recursive: true }]);
  }
}

module.exports = { mkDir };
