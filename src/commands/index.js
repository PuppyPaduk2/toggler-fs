const { commandAdd } = require("./add");
const { commandRemove } = require("./remove");
const { commandShow } = require("./show");
const { commandHide } = require("./hide");
const { commandClear } = require("./clear");
const { commandList } = require("./list");

module.exports = {
  commandAdd,
  commandRemove,
  commandShow,
  commandHide,
  commandClear,
  commandList,
};
