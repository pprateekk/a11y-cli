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

    //check for the config file, load if exists
    const defaultConfigPath = path.resolve(process.cwd(), ".a11yrc");
    let axeConfig = {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
    };
    let ignoreRules = [];

    if (fs.existsSync(defaultConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(defaultConfigPath, "utf-8"));

        //override the default if user chooses to
        if (config.runOnly) axeConfig.runOnly = config.runOnly;
        if (config.rules) axeConfig.rules = config.rules;

        if (config.ignore && Array.isArray(config.ignore)) {
          ignoreRules = config.ignore;
        }
        console.log("Loaded .a11yrc config file");
      } catch (err) {
        console.warn("Faile to load .a11yrc: ", err.message);
      }
    }

    const results = await runAxe(page, axeConfig);

    if (ignoreRules.length > 0) {
      results.violations = results.violations.filter(
        (v) => !ignoreRules.includes(v.id)
      );
    }

    //check if severity is entered and if it's correct
    if (severity && !validSeverities.includes(severity)) {
      throw new Error(
        `Invalid severity level: ${severity}. Must be one of ${validSeverities.join(
          ", "
        )}`
      );
    }
    let filteredResults = results;

    //filter the results based on severity
    if (severity) {
      filteredResults = {
        ...results,
        violations: results.violations.filter((v) => v.impact === severity),
      };
    }

    //generate JSON/HTML report
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
