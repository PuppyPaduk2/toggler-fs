const { getStore } = require("../lib/store");
const { eachFile } = require("../lib/each-file");
const { removePath } = require("../lib/remove-path");
const objectHash = require("object-hash");

async function commandRemove(params = {}) {
  const { hashFiles = [] } = params;
  const { pathStore } = await getStore();

  const checkPath = async (_pathFile) => {
    const pathFile = _pathFile.replace(pathStore, "");

    if (pathFile.length) {
      const hashFile = objectHash(pathFile);

      if (hashFiles.includes(hashFile)) {
        await removePath(_pathFile);
      }
    }
  };

  await eachFile(pathStore, checkPath, checkPath);
}

module.exports = { commandRemove };
