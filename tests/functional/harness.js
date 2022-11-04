/* global process */

// A convienience wrapper for testing with the headless browsers.

var playwright = require("playwright");

function Harness({ startURL, browserType = "webkit" }) {
  return {
    setUp,
    tearDown,
    checkFillField,
    stall,
    loadClick,
    waitAssertClick,
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

  async function checkFillField(
    page,
    test,
    { selector, name, text, texts, hitEnterAfterEachPiece },
  ) {
    var field = await page.$(selector);
    test.ok(field, `${name} field exists.`);
    // Clear existing text in field.
    await page.$eval(selector, (el) => (el.value = ""));
    if (texts) {
      for (let i = 0; i < texts.length; ++i) {
        await field.type(texts[i]);
        if (hitEnterAfterEachPiece) {
          await field.press("Enter");
        }
      }
    } else {
      await field.type(text);
      if (hitEnterAfterEachPiece) {
        await field.press("Enter");
      }
    }
    return field;
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

  async function waitAssertClick({ page, t, selector }) {
    var el = await page.waitFor(selector);
    t.ok(el, `${selector} exists.`);
    return el.click();
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
