const { program } = require("commander");
const webScanCommand = require("./src/commands/webScan");
const initConfig = require("./src/commands/initConfig");

program
  .name("a11y-cli")
  .description("A CLI to scan web pages for accessibility issues")
  .version("1.0.0");

program.addCommand(webScanCommand);
program.addCommand(initConfig);

program.parse(process.argv);
