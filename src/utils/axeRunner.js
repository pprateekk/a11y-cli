const axe = require("axe-core");

async function runAxe(page) {
  await page.addScriptTag({ path: require.resolve("axe-core") });

  const results = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
    });
  });
  return results;
}

module.exports = runAxe;
