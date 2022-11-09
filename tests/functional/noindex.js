/* global process, __dirname */

var test = require("tape");
var Harness = require("./harness");
var path = require("path");
// In Docker, .env.test won't be there, but the actual environment variables
// will have been set by local.builder.yml.
require("dotenv").config({ path: path.join(__dirname, "../../.env.test") });

//var browserTypes = ["firefox", "chromium", "webkit"];
var browserTypes = ["webkit"];

const testDocName = "Small pdf";
const uploadedDocName = testDocName.replace(/ /g, "-");
const baseURL = "https://www.dev.documentcloud.org/";
const appURL = baseURL + "app";

(async () => {
  try {
    browserTypes.forEach(runSuiteWithBrowserType);
  } catch (error) {
    console.error(error, error.stack);
  }

  async function runSuiteWithBrowserType(browserType) {
    var harness = Harness({
      // TODO: Grab from env.
      startURL: baseURL,
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
    await runTest({
      name: "Open doc test",
      testBody: openDocTest,
      harness,
      browser,
    });
    await runTest({
      name: "Open access dialog from viewer",
      testBody: openAccessDialogFromViewerTest,
      harness,
      browser,
    });
    await runTest({
      name: "Delete uploaded documents",
      testBody: deleteDocTest,
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

    await fileChooser.setFiles(`tests/functional/fixtures/${testDocName}.pdf`);

    var publicButton = await page.getByText(
      "Document will be publicly visible.",
    );
    await publicButton.click();

    var beginButton = await page.getByText("Begin upload");
    await beginButton.click();

    // TODO: Name file uniquely each time? Otherwise, this
    // can be tripped up by another doc with the same name
    // in the manager view.
    var openDocButton = await getOpenButtonForDoc({
      managerPage: page,
      docName: testDocName,
    });
    t.ok(
      openDocButton && (await openDocButton.count()) === 1,
      "Open button appears for uploaded doc.",
    );
    t.pass("Document uploaded.");
  } catch (error) {
    t.fail(`Error uploading: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

async function deleteDocTest({ harness, browser, t }) {
  try {
    var page = await harness.getOnlyPage({ browser, t });
    if (!page) {
      return;
    }
    await page.goto(appURL);
    await page.waitForURL((url) => url.href.startsWith(appURL));

    var openDocButton = await getOpenButtonForDoc({
      managerPage: page,
      docName: uploadedDocName,
    });
    // Playwright does not expose parentElement or parentNode.
    var openDocLink = await openDocButton.locator("../..");
    await openDocLink.waitFor();
    var docURL = await openDocLink.getAttribute("href");
    console.log("docURL", docURL);
  } catch (error) {
    t.fail(`Error opening doc: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

async function openDocTest({ harness, browser, t }) {
  try {
    var page = await harness.getOnlyPage({ browser, t });
    if (!page) {
      return;
    }
    var openDocButton = await getOpenButtonForDoc({
      managerPage: page,
      docName: testDocName,
    });
    await harness.loadClick(page, openDocButton);
    t.ok(
      page.url().endsWith(uploadedDocName.toLowerCase()),
      "Navigated to the document's page.",
    );
  } catch (error) {
    t.fail(`Error opening doc: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

async function openAccessDialogFromViewerTest({ harness, browser, t }) {
  try {
    var page = await harness.getOnlyPage({ browser, t });
    if (!page) {
      return;
    }
    var accessLink = await page.getByText("Public access");
    await accessLink.click();
    //await harness.stall(60000);
  } catch (error) {
    t.fail(
      `Error opening access dialog from viewer: ${error.message}\n${error.stack}\n`,
    );
    process.exit(1);
  }
}

async function getOpenButtonForDoc({ managerPage, docName }) {
  var docCard = await managerPage.locator(".docscontainer .card", {
    hasText: docName,
  });
  await docCard.waitFor();

  var button = docCard.locator("button", { hasText: "Open" });
  await button.waitFor({ timeout: 180000 });
  return button;
}
