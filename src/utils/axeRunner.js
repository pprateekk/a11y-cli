const axe = require("axe-core");

async function runAxe(page, axeConfig) {
  await page.addScriptTag({ path: require.resolve("axe-core") });

  const results = await page.evaluate(async (config) => {
    return await axe.run(document, config);
  }, axeConfig);
  return results;
}

module.exports = runAxe;
