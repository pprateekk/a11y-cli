# a11y-cli: Automated Accessibility Testing Tool (CLI-based)

## **Overview**

`a11y-cli` is a simple command-line tool that helps you quickly check websites for accessibility issues. It uses **Puppeteer** to load pages and **axe-core** to scan them against **WCAG 2.0/2.1** standards.

You can generate JSON or HTML reports, filter issues by severity, customize rules and even compare results across different runs.

---

## Features

- Scan any website for accessibility violations
- Filter results by severity (`critical`, `serious`)
- Customize rules with a `.a11yrc` config file
- Ignore specific rules if needed
- Compare new scans with old reports (Delta Reporting)
- Generate clean JSON or HTML reports
- CI ready for automated workflows

---

## Installation

Clone this repo:

```bash
git clone https://github.com/pprateekk/a11y-cli.git
cd a11y-cli
npm install
```

---

## How to Use

If running **locally (without installing globally)**:

```bash
node index.js web-scan <url> [options]
```

If installed **globally** via `npm install -g`, you can run:

```bash
a11y-cli web-scan <url> [options]
```

### Example

Scan `https://www.example.com` and save the report:

```bash
node index.js web-scan https://www.example.com --format html --output report.html
```

---

## CLI Options

| Option                 | Description                            | Default       |
| :--------------------- | :------------------------------------- | :------------ |
| `<url>`                | URL of the page to scan                | —             |
| `-o, --output <file>`  | Output file name                       | `report.json` |
| `--format <type>`      | Choose output format: `json` or `html` | `json`        |
| `--headless`           | Run browser in headless mode           | `true`        |
| `--severity <level>`   | Only show issues of a certain severity | none          |
| `--diff-source <file>` | Compare with a previous report         | none          |

---

## Configure a11y-cli with `.a11yrc`

You can control how the scan behaves using `.a11yrc` configuration file.

Instead of writing it manually, you can generate a default config using the CLI:

### Create a Default `.a11yrc`

```bash
node index.js init-config
```

This will create a `.a11yrc` file in your current directory with defaults like:

```json
{
  "runOnly": {
    "type": "tag",
    "values": ["wcag2a", "wcag2aa"]
  },
  "rules": {
    "color-contrast": { "enabled": true },
    "image-alt": { "enabled": true }
  },
  "ignore": []
}
```

If a `.a11yrc` file already exists, the command will **not** overwrite it unless you explicitly use the `--force` option.

---

## Delta Reporting

If you pass an old report with `--diff-source`, `a11y-cli` will:

- Show new issues introduced
- Show issues that got fixed

Example:

```bash
node index.js web-scan https://example.com --diff-source previous-report.json
```

---

## Using in CI/CD

You can easily integrate `a11y-cli` into your CI pipelines to automate accessibility checks for your projects.

An example using GitHub Actions:

```yml
name: Accessibility Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  a11y-scan:
    runs-on: macos-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install a11y-cli
        run: npm install -g git+https://github.com/pprateekk/a11y-cli.git

      - name: Run accessibility scan (HTML + JSON)
        run: |
          a11y-cli web-scan https://your-deployment-url.com \
            --format html \
            --output report.html
          a11y-cli web-scan https://your-deployment-url.com \
            --format json \
            --output report.json

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: report.html
```

This workflow will:

- Install `a11y-cli` tool
- Scan your deployment site automatically on every push or pull request
- Save the accessibility audit report as an artifact you can download

You can even **fail the build** if serious or critical issues are found:

```yml
- name: Fail CI on critical/serious violations
  run: |
    node -e '
      const report = require("./report.json");
      const critical = report.violations.filter(v =>
        v.impact === "critical" || v.impact === "serious"
      );
      if (critical.length) {
        console.error(`${critical.length} critical/serious issues found.`);
        process.exit(1);
      } else {
        console.log("No critical/serious accessibility issues found.");
      }
    '
```

---

## Example Test Repository

You can see a real example of `a11y-cli` being used in a GitHub Actions CI workflow here: [**a11y-cli-test**](https://github.com/pprateekk/a11y-cli-test)

This repository contains:

- A simple static HTML page
- A GitHub Actions workflow that runs `a11y-cli` on every push
- An automatically generated accessibility report as an artifact

---

## Development

To test locally:

```bash
npm install
node index.js web-scan https://example.com
```
