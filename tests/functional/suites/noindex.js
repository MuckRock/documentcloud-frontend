/* global process, __dirname */

var test = require("tape");
var Harness = require("../harness");
var path = require("path");

// In Docker, .env files won't be there, but the actual environment variables
// will have been set by local.builder.yml.
var envFilename = ".env.test";
if (process.argv.length > 3 && process.argv[2] === "--envfile") {
  envFilename = process.argv[3];
}
require("dotenv").config({
  path: path.join(__dirname, `../../../${envFilename}`),
});

var { signInTest } = require("../cases/auth-tests.js");
var {
  uploadTest,
  openDocTest,
  deleteDocTest,
} = require("../cases/crud-tests.js");
var {
  openAccessDialogFromViewerTest,
  setHiddenPropInAccessDialogTest,
} = require("../cases/access-tests.js");

const browserType = process.env.BROWSER || "webkit";
const testDocName = "Small pdf";
const baseURL = process.env.APP_URL;
const appURL = baseURL + "app";

// TODO when another suite is added: Abstract the harness setup and teardown and the env setup.
(async () => {
  try {
    var harness = Harness({
      // TODO: Grab from env.
      startURL: baseURL,
      browserType,
    });
    var { browser, page } = await harness.setUp();
    var base = { harness, browser, page, appURL, testDocName };
    await runTest({ ...base, name: "Sign-in test", testBody: signInTest });
    await runTest({ ...base, name: "Upload test", testBody: uploadTest });
    await runTest({ ...base, name: "Open doc test", testBody: openDocTest });
    await runTest({
      ...base,
      name: "Open access dialog from viewer",
      testBody: openAccessDialogFromViewerTest,
    });
    await runTest({
      ...base,
      name: "Make document hidden in access dialog",
      testBody: setHiddenPropInAccessDialogTest,
    });
    await runTest({
      ...base,
      name: "Open access dialog from viewer again",
      testBody: openAccessDialogFromViewerTest,
    });
    await runTest({
      ...base,
      name: "Make document NOT hidden in access dialog",
      testBody: setHiddenPropInAccessDialogTest,
      shouldHide: false,
    });
  } catch (error) {
    console.error(error, error.stack);
  } finally {
    // Test deleting document regardless of what happens
    // so the next run is clean.
    await runTest({
      ...base,
      name: "Delete uploaded documents",
      testBody: deleteDocTest,
    });
    await harness.tearDown(browser);
  }
})();

// TODO, if we have a lot of time: TypeScript.
function runTest(opts) {
  return new Promise(executor);

  function executor(resolve, reject) {
    var testBody = opts.testBody;
    delete opts.testBody;

    test(opts.name, waitForTestBody);

    async function waitForTestBody(t) {
      try {
        await testBody({ ...opts, t });
        t.end();
        resolve();
      } catch (error) {
        t.end();
        reject(error);
      }
    }
  }
}
