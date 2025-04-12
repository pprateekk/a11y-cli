// puppeteer wrapper
const puppeteer = require("puppeteer");

async function launchBrowser(headless = true) {
  const browser = await puppeteer.launch({
    headless,
  });
  const page = await browser.newPage();

  return { browser, page };
}

module.exports = { launchBrowser };
