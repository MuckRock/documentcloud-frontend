/* global process */

// A convienience wrapper for testing with the headless browsers.

var playwright = require("playwright");

function Harness({ startURL, browserType = "webkit" }) {
  var browser;

  return {
    setUp,
    tearDown,
    goWaitForURL,
    stall,
    loadClick,
    getOnlyPage,
  };

  async function setUp() {
    var config = {
      headless: !process.env.DEBUG,
      //args: [
      //"--webview-enable-modern-cookie-same-site",
      //"--ignore-certificate-errors",
      //"--ignore-certificate-errors-skip-list",
      //"--allow-cross-origin-auth-prompt",
      //"--allow-external-pages",
      //"--allow-failed-policy-fetch-for-test",
      //"--allow-running-insecure-content",
      //],
    };
    browser = await playwright[browserType].launch(config);
    var page = await browser.newPage({ ignoreHTTPSErrors: true });
    await page.goto(startURL);
    return { browser, page };
  }

  async function tearDown() {
    await Promise.all(browser.contexts().map((context) => context.close()));
    return browser.close();
  }

  async function goWaitForURL({ page, url }) {
    page.goto(url);
    return page.waitForURL((currentURL) => currentURL.href.startsWith(url));
  }

  function stall(time) {
    return new Promise(callSetTimeout);

    function callSetTimeout(resolve) {
      setTimeout(resolve, time);
    }
  }

  function loadClick(page, clickable) {
    return Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      clickable.click(),
    ]);
  }

  async function getOnlyPage() {
    var contexts = await browser.contexts();
    if (contexts.length !== 1) {
      throw new Error(
        `There is more than one context. (Actual number of contexts: ${contexts.length})`,
      );
    }

    var pages = await contexts[0].pages();
    if (pages.length !== 1) {
      throw new Error(
        `There is more than one page. (Actual number of pages: ${pages.length})`,
      );
    }

    return pages[0];
  }
}

module.exports = Harness;
