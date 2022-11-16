/* global process */

// A convienience wrapper for testing with the headless browsers.

var playwright = require("playwright");

function Harness({ startURL, browserType = "webkit" }) {
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
    };
    var browser = await playwright[browserType].launch(config);
    var page = await browser.newPage({ ignoreHTTPSErrors: true });
    await page.goto(startURL);
    return { browser, page };
  }

  async function tearDown(browser) {
    await browser.close();
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

  async function getOnlyPage({ browser, t }) {
    var contexts = await browser.contexts();
    if (contexts.length !== 1) {
      t.fail(
        `There is only one context. (Actual number of contexts: ${contexts.length})`,
      );
      return;
    }

    var pages = await contexts[0].pages();
    if (pages.length !== 1) {
      t.fail(
        `There is only one page. (Actual number of pages: ${pages.length})`,
      );
      return;
    }

    return pages[0];
  }
}

module.exports = Harness;
