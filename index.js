const { program } = require("commander");
const webScanCommand = require("./src/commands/webScan");

program
  .name("a11y-cli")
  .description("A CLI to scan web pages for accessibility issues")
  .version("1.0.0");

program.addCommand(webScanCommand);

program.parse(process.argv);
