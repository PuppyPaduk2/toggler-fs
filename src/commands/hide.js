const { hidePath } = require("../lib/hide-path");
const { getStore } = require("../lib/store");

async function commandHide() {
  const { pathStore } = await getStore();

  await hidePath(pathStore, process.cwd());
}

module.exports = { commandHide };
