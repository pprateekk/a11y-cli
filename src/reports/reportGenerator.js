const fs = require("fs");
const path = require("path");
const { launchBrowser } = require("../utils/browser");
const runAxe = require("../utils/axeRunner");
const { report } = require("process");
const generateHTMLReport = require("./htmlReportFormatter");

async function runAudit({
  url,
  output,
  format,
  headless,
  severity,
  comparisonFilePath,
}) {
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

    let comparisonResult = results;

    if (comparisonFilePath) {
      if (!fs.existsSync(comparisonFilePath)) {
        throw new Error(`File not found at path: ${comparisonFilePath}`);
      } else {
        comparisonResult = await compareViolations(
          filteredResults.violations,
          comparisonFilePath
        );
        console.log(`Fixed: ${comparisonResult.fixedIssues.length}`);
        console.log(`New: ${comparisonResult.newIssues.length}`);
      }
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

//unique strings for each violation-nod epair
function getViolationKeys(violationsArr) {
  const allKeys = [];
  for (const violation of violationsArr) {
    const ruleId = violation.id;

    for (const node in violation.nodes) {
      const selector = Array.isArray(node.target)
        ? node.target.join(",")
        : "[no-target]";
      const uniqueKey = `${ruleId}|${selector}`;
      allKeys.push(uniqueKey);
    }
  }

  return allKeys;
}

async function compareViolations(currViolations, filePath) {
  let previousViolations = [];

  if (filePath && fs.existsSync(filePath)) {
    const prevReportContent = fs.readFileSync(filePath, "utf-8");
    const parsedReport = JSON.parse(prevReportContent);
    previousViolations = parsedReport.violations || [];
  }

  //violiations -> "rile-id|.element-selector"
  const currKeys = getViolationKeys(currViolations);
  const prevKeys = getViolationKeys(previousViolations);

  //find new issues (the ones present in the current, but not in previous)
  const newIssues = [];
  for (const violation of currViolations) {
    const newNodes = violation.nodes.filter((node) => {
      const key = `${violation.id}|${
        Array.isArray(node.target) ? node.target.join(",") : "[no-target]"
      }`;
      return !prevKeys.includes(key); //it is the new issue
    });

    if (newNodes.length > 0) {
      newIssues.push({ ...violation, nodes: newNodes });
    }
  }

  //find fixed issues( the ones that were in previoud but not in the cirrent ones now)
  const fixedIssues = [];
  for (const violation of previousViolations) {
    const resolvedNodes = violation.nodes.filter((node) => {
      const key = `${violation.id}|${
        Array.isArray(node.target) ? node.target.join(",") : "[no-target]"
      }`;
      return !currKeys.includes(key); //it is no longer an issue
    });

    if (resolvedNodes.length > 0) {
      fixedIssues.push({ ...violation, nodes: resolvedNodes });
    }
  }

  return { newIssues, fixedIssues };
}
