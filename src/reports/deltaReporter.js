const fs = require("fs");
const path = require("path");

function loadPreviousViolations(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found at path: ${filePath}`);
  }
  const content = fs.readFileSync(resolved, "utf-8");
  const parsed = JSON.parse(content);
  return parsed.violations || [];
}

function getViolationKeys(violations) {
  const keys = [];
  for (const violation of violations) {
    for (const node of violation.nodes) {
      const selector = Array.isArray(node.target)
        ? node.target.join(",")
        : "[no-target]";
      keys.push(`${violation.id}|${selector}`);
    }
  }
  return keys;
}

function compareViolations(currViolations, prevViolations) {
  const currKeys = getViolationKeys(currViolations);
  const prevKeys = getViolationKeys(prevViolations);

  const newIssues = currViolations
    .map((violation) => {
      const newNodes = violation.nodes.filter((node) => {
        const key = `${violation.id}|${
          Array.isArray(node.target) ? node.target.join(",") : "[no-target]"
        }`;
        return !prevKeys.includes(key);
      });
      return newNodes.length ? { ...violation, nodes: newNodes } : null;
    })
    .filter(Boolean);

  const fixedIssues = prevViolations
    .map((violation) => {
      const resolvedNodes = violation.nodes.filter((node) => {
        const key = `${violation.id}|${
          Array.isArray(node.target) ? node.target.join(",") : "[no-target]"
        }`;
        return !currKeys.includes(key);
      });
      return resolvedNodes.length
        ? { ...violation, nodes: resolvedNodes }
        : null;
    })
    .filter(Boolean);

  return { newIssues, fixedIssues };
}

module.exports = { loadPreviousViolations, compareViolations };
