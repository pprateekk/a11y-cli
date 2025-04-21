const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

const initConfig = new Command("init-config");

initConfig
  .description("Create a default .a11yrc config file")
  .option("-f, --force", "Overwrite existing .a11yrc file if it exists")
  .action((options) => {
    const filePath = path.resolve(process.cwd(), ".a11yrc");

    if (fs.existsSync(filePath) && !options.force) {
      console.log(" .a11yrc file already exists. Use --force to overwrite.");
      return;
    }

    const defaultConfig = {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
      rules: {
        "color-contrast": { enabled: true },
        "image-alt": { enabled: true },
      },
      ignore: [],
    };

    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
    if (options.force) {
      console.log("Overwrote existing .a11yrc with default config.");
    } else {
      console.log("Created default .a11yrc file.");
    }
  });

module.exports = initConfig;
