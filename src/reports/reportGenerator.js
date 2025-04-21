const fs = require("fs");
const path = require("path");
const { launchBrowser } = require("../utils/browser");
const runAxe = require("../utils/axeRunner");
const { report } = require("process");
const generateHTMLReport = require("./htmlReportFormatter");

async function runAudit({ url, output, format, headless, severity }) {
  const { browser, page } = await launchBrowser(headless);
  const validSeverities = ["critical", "serious"];

  try {
    await page.goto(url);

    const results = await runAxe(page);

    if (severity && !validSeverities.includes(severity)) {
      throw new Error(
        `Invalid severity level: ${severity}. Must be one of ${validSeverities.join(
          ", "
        )}`
      );
    }
    let filteredResults = results;

    if (severity) {
      filteredResults = {
        ...results,
        violations: results.violations.filter((v) => v.impact === severity),
      };
    }

    let reportContent;
    if (format == "HTML") {
      reportContent = generateHTMLReport(filteredResults, url, severity);
    } else {
      reportContent = JSON.stringify(filteredResults, null, 2);
    }

    const outputPath = path.resolve(output);
    fs.writeFileSync(outputPath, reportContent);
    console.log(`Report saved to ${outputPath}`);
  } finally {
    await browser.close();
  }
}

module.exports = runAudit;
