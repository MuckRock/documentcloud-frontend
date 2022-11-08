/* global process, __dirname */

var test = require("tape");
var Harness = require("./harness");
var path = require("path");
// In Docker, .env.test won't be there, but the actual environment variables
// will have been set by local.builder.yml.
require("dotenv").config({ path: path.join(__dirname, "../../.env.test") });

//var browserTypes = ["firefox", "chromium", "webkit"];
var browserTypes = ["webkit"];

const uploadedDocName = "the-nature-of-the-firm-CPEC11";

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
    await runTest({
      name: "Upload test",
      testBody: uploadTest,
      harness,
      browser,
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

async function signInTest({ page, t }) {
  try {
    await page.getByText("Sign in").click({ strict: false });
    await page.locator("#id_login").fill(process.env.TEST_USER);
    await page.locator("#id_password").fill(process.env.TEST_PASS);
    var form = await page.locator("#login_form");
    var logInButton = await form.getByText("Log in");
    await logInButton.click();
    t.pass("Signed in");
  } catch (error) {
    t.fail(`Error while signing in: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

async function uploadTest({ harness, browser, t }) {
  try {
    var page = await harness.getOnlyPage({ browser, t });
    if (!page) {
      return;
    }

    var buttons = await page.locator("button");
    var uploadButton = await buttons.filter({ hasText: /Upload/ });
    await uploadButton.click();

    var selectFilesButton = await buttons.filter({ hasText: /Select files/ });

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      selectFilesButton.click(),
    ]);

    await fileChooser.setFiles(
      "tests/functional/fixtures/the-nature-of-the-firm-CPEC11.pdf",
    );

    var publicButton = await page.getByText(
      "Document will be publicly visible.",
    );
    await publicButton.click();

    var beginButton = await page.getByText("Begin upload");
    await beginButton.click();

    var docCard = await page.locator(".docscontainer .card", {
      hasText: uploadedDocName,
    });
    await docCard.waitFor();
    console.log("docCard.count", await docCard.count());

    //var locatorWithUploadedDoc = await cards.filter();
    //t.equal(
    //await locatorWithUploadedDoc.count(),
    //1,
    //"Uploaded doc appears in the manager view.",
    //);
    //
    //var openDocButton = await locatorWithUploadedDoc.locator("Open");
    //
    //console.log("openDocButton.count", await openDocButton.count());
    //var currentLocator = locatorWithUploadedDoc;
    //
    //const parentSearchTries = 5;
    //for (let i = 0; i < parentSearchTries; ++i) {
    //currentLocator = await currentLocator.locator("..");
    //if (!currentLocator) {
    //t.fail("Card containing the uploaded doc was found.");
    //break;
    //}
    //console.log("currentLocator count", await currentLocator.count());
    //
    //if (await currentLocator.filter({ has: ".card" })) {
    //cardWithUploadedDoc = currentLocator;
    //break;
    //}
    //}
    //
    //t.ok(
    //cardWithUploadedDoc && (await cardWithUploadedDoc.count()) === 1,
    //"Card containing the uploaded doc was found.",
    //);

    //var openButton = await cardWithUploadedDoc.getByText("Open");
    //t.ok(
    //openButton && (await openButton.count()) === 1,
    //"Open button appears for uploaded doc.",
    //);
    await harness.stall(60000);
  } catch (error) {
    t.fail(`Error uploading: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}
