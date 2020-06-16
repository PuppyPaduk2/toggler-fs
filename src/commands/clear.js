const { removePath } = require("../lib/remove-path");
const { getStore } = require("../lib/store");

async function commandClear() {
  const { pathStore } = await getStore();

  removePath(pathStore, process.cwd());
}

module.exports = { commandClear };
