const { copyPath } = require("../lib/copy-path");
const { getStore } = require("../lib/store");

async function commandShow() {
  const { pathStore } = await getStore();

  await copyPath(pathStore, process.cwd());
}

module.exports = { commandShow };
