const fs = require("fs");
const path = require("path");
const { launchBrowser } = require("../utils/browser");
const runAxe = require("../utils/axeRunner");
const { report } = require("process");
const generateHTMLReport = require("./htmlReportFormatter");

async function runAudit({ url, output, format, headless }) {
  const { browser, page } = await launchBrowser(headless);

  try {
    await page.goto(url);

    const results = await runAxe(page);

    let reportContent;
    if (format == "HTML") {
      reportContent = generateHTMLReport(results, url);
    } else {
      reportContent = JSON.stringify(results, null, 2);
    }

    const outputPath = path.resolve(output);
    fs.writeFileSync(outputPath, reportContent);
    console.log(`Report saved to ${outputPath}`);
  } finally {
    await browser.close();
  }
}

module.exports = runAudit;
