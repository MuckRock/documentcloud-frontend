/* global process */

// A convienience wrapper for testing with the headless browsers.

var playwright = require("playwright");

function Harness({ startURL, browserType = "webkit" }) {
  return {
    setUp,
    tearDown,
    checkFillField,
    stall,
    navClick,
    loadClick,
    waitAssertClick,
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

  function navClick(page, el) {
    if (!page || !el) {
      return null;
    }
    return Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      el.click(),
    ]);
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
}

module.exports = Harness;
