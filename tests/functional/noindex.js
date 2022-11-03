/* global process, __dirname */

var test = require("tape");
var Harness = require("./harness");
var path = require("path");
// In Docker, .env.test won't be there, but the actual environment variables
// will have been set by local.builder.yml.
require("dotenv").config({ path: path.join(__dirname, "../../.env.test") });

var browserTypes = ["firefox", "chromium", "webkit"];

(async () => {
  try {
    browserTypes.forEach(runSuiteWithBrowserType);
  } catch (error) {
    console.error(error, error.stack);
  }

  async function runSuiteWithBrowserType(browserType) {
    var harness = Harness({
      // TODO: Grab from env.
      startURL: "https://www.dev.documentcloud.org/",
      browserType,
    });
    var { browser, page } = await harness.setUp();
    await runTest({
      name: "Sign-in test",
      testBody: signInTest,
      harness,
      browser,
      page,
    });
    await harness.tearDown(browser);
  }
})();

function runTest({ name, testBody, harness, browser, page }) {
  return new Promise(executor);

  function executor(resolve, reject) {
    test(name, waitForTestBody);

    async function waitForTestBody(t) {
      try {
        await testBody({ harness, browser, page, t });
        t.end();
        resolve();
      } catch (error) {
        t.end();
        reject(error);
      }
    }
  }
}

async function signInTest({ page, browser, t }) {
  try {
    await page.getByText("Sign in").click({ strict: false });
    await page.locator("#id_login").fill(process.env.TEST_USER);
    await page.locator("#id_password").fill(process.env.TEST_PASS);
    console.log("browser.contexts", browser.contexts().length);
    var form = await page.locator("#login_form");
    var logInButton = await form.getByText("Log in");
    console.log("logInButton count", await logInButton.count());
    await logInButton.click();
    t.pass("Signed in");
  } catch (error) {
    t.fail(`Error while signing in: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}
