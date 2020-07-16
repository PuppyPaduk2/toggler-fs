const path = require("path");
const { nodePromise } = require("./node-promise");
const objectHash = require("object-hash");
const fs = require("fs");

async function getStore(options = {}) {
  const { keyStore } = options;
  const pathStore = getPathStore(keyStore);

  await nodePromise(fs.access, [pathStore]);

  return { keyStore, pathStore };
}

function getPathStore(keyStore = getKeyStore()) {
  const pathRootStore = path.resolve(__dirname, "../../.store");

  return path.resolve(pathRootStore, keyStore);
}

function getKeyStore() {
  return objectHash(process.cwd());
}

module.exports = { getStore, getPathStore, getKeyStore };
