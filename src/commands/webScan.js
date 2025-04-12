const { Command } = require("commander");

const webScan = new Command("web-scan");

webScan
  .description("Scan a web page for accessibility issues")
  .argument("<url>", "URL for the page to scan")
  .option("-o, --output <file>", "Output file path for results", "report.json")
  .option("--format <type>", "Output format: JSON or HTML", "JSON")
  .option("--headless", "Run in headless mode", true)
  .action();

module.exports = webScan;
