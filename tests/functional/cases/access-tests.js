/* global process */
var { openDoc } = require("../test-utils");

async function setHiddenPropInAccessDialogTest({
  harness,
  t,
  shouldHide = true,
  testDocName,
  appURL,
}) {
  try {
    var page = await harness.getOnlyPage();
    if (!page) {
      return;
    }

    var hideCheck = await page.locator(".hide-from-search-checkbox");
    await hideCheck[shouldHide ? "check" : "uncheck"]();
    //await page.screenshot({ path: "after-checking.png", fullPage: true });

    var accessDialog = await page.locator(".modalcontainer .modal");
    var changeButton = await page
      .locator(".modalcontainer button[type='submit']")
      .filter({ hasText: "Change" });
    await Promise.all([
      changeButton.click(),
      accessDialog.waitFor({ state: "detached" }),
    ]);
    //await page.screenshot({ path: "after-change-button.png", fullPage: true });

    await openDoc({ page, harness, docName: testDocName, appURL });
    await page.screenshot({ path: "reopeneddoc.png", fullPage: true });

    var robotsMetaTag = await page.locator("meta[name='robots']");

    if (shouldHide) {
      // This waitFor is necessary. I think it's because for page.locator() may default
      // to waiting until the element is visible, but meta tags never are.
      await robotsMetaTag.waitFor({ state: "attached" });
      const tagCount = await robotsMetaTag.count();
      t.equal(tagCount, 1, "Document has a meta tag for robots");
      t.equal(
        await robotsMetaTag.getAttribute("content"),
        "noindex",
        'meta tag content is set to "noindex"',
      );
    } else {
      try {
        await robotsMetaTag.waitFor({ state: "attached", timeout: 5000 });
      } catch (e) {
        // TODO: Find out if there is a less strange way to test for the absence
        // of a DOM element.
        if (/locator\.waitFor: Timeout \d+ms exceeded/.test(e.message)) {
          t.pass("Document has no meta tag for robots");
        } else {
          t.fail("Unexpected exception while confirming lack of robots tag.");
          console.log(
            `Unexpected exception while confirming lack of robots tag: ${e.message}, ${e.stack}`,
          );
        }
      }
    }
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

module.exports = {
  openAccessDialogFromViewerTest,
  setHiddenPropInAccessDialogTest,
};
