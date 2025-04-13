const { Command } = require("commander");
const runAudit = require("../reports/reportGenerator");

const webScan = new Command("web-scan");

webScan
  .description("Scan a web page for accessibility issues")
  .argument("<url>", "URL for the page to scan")
  .option("-o, --output <file>", "Output file path for results", "report.json")
  .option("--format <type>", "Output format: JSON or HTML", "JSON")
  .option("--headless", "Run in headless mode", true)
  .action(async (url, options) => {
    try {
      await runAudit({
        url,
        output: options.output,
        format: options.format.toUpperCase(),
        headless: options.headless,
      });
    } catch (err) {
      console.error("Web scanning failed: ", err.message);
    }
  });

module.exports = webScan;
