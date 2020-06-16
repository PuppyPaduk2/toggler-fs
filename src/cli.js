#!/usr/bin/env node

const { program } = require("commander");
const { timeCommand } = require("./lib/time");
const commands = require("./commands");

require("colors");

const { version } = require("../package.json");

// Main programm
program.version(version);

// Command 'add'
program.command("add <files>").action((_, command) => {
  timeCommand("add", () => {
    return commands.commandAdd({ files: command.args || [] });
  });
});

// Command 'remove'
program.command("remove <hash-files>").action((_, command) => {
  timeCommand("remove", () => {
    return commands.commandRemove({ hashFiles: command.args || [] });
  });
});

// Command 'show'
program.command("show").action(() => {
  timeCommand("show", () => {
    return commands.commandShow();
  });
});

// Command 'hide'
program.command("hide").action(() => {
  timeCommand("hide", () => {
    return commands.commandHide();
  });
});

// Command 'clear'
program.command("clear").action(() => {
  timeCommand("clear", () => {
    return commands.commandClear();
  });
});

// Command 'list'
program.command("list").action(() => {
  timeCommand("list", () => {
    return commands.commandList();
  });
});

program.parse(process.argv);
