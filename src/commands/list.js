const { getStore } = require("../lib/store");
const objectHash = require("object-hash");
const { eachFile } = require("../lib/each-file");

async function commandList() {
  const { pathStore } = await getStore();

  const logPath = ({ pre = "", post = "" }) => (_pathFile) => {
    const pathFile = _pathFile.replace(pathStore, "");

    if (pathFile.length) {
      const hashFile = objectHash(pathFile);

      console.log(`${pre}${hashFile.cyan} ${pathFile}${post}`);
    }
  };

  await eachFile(pathStore, logPath({ pre: "📄 " }), logPath({ pre: "📁 " }));
}

module.exports = { commandList };
