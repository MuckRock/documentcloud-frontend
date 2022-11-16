/* global process */

var {
  getOpenButtonForDoc,
  getURLForDocByName,
  openDoc,
} = require("../test-utils");

async function uploadTest({ harness, browser, t, testDocName }) {
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

async function deleteDocTest({ harness, browser, t, appURL, testDocName }) {
  try {
    var page = await harness.getOnlyPage({ browser, t });
    if (!page) {
      return;
    }
    await page.goto(appURL);
    await page.waitForURL((url) => url.href.startsWith(appURL));

    const docURL = await getURLForDocByName({
      docName: testDocName,
      page,
      harness,
      appURL,
    });

    var docRows = await page.locator(".card .row");
    var docRowWithURL;
    const rowCount = await docRows.count();
    for (let i = 0; i < rowCount; ++i) {
      let docRow = docRows.nth(i);
      let link = await docRow.locator(`a[href="${docURL}"]`);
      const hitCount = await link.count();
      // As of 2022-11-10, there will be at least two matches if this is the
      // correct row: One for the text link and one for the image link.
      if (hitCount > 0) {
        docRowWithURL = docRow;
        break;
      }
    }

    if (!docRowWithURL) {
      t.fail("Found row with target document URL.");
      return;
    }

    //var docCheckBox = await docRowWithURL.getByRole("check");
    var docCheckBoxSpan = await docRowWithURL.locator(
      'input[type="checkbox"] ~ span',
    );
    // We have a trick checkbox. The actual input is hidden (opacity 0, under a span,
    // so we actually need to click the span (which intercepts pointer events)
    // to trigger the check.
    await docCheckBoxSpan.click();

    var editSpan = await page
      .locator(".barcontainer .action")
      .getByText("Edit");
    await editSpan.click();
    var deleteDiv = await page
      .locator(".barcontainer .menu")
      .getByText("Delete");
    await deleteDiv.click();
    var deleteButton = await page
      .locator(".modalcontainer button[type='submit']")
      .filter({ hasText: "Delete" });
    await deleteButton.click();
    t.pass("Document deleted without errors.");
    // TODO: Make sure the document is actually gone?
  } catch (error) {
    t.fail(`Error opening doc: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

async function openDocTest({ harness, browser, t, testDocName, appURL }) {
  try {
    var page = await harness.getOnlyPage({ browser, t });
    if (!page) {
      return;
    }

    const slugifiedDocName = testDocName.replace(/ /g, "-");
    await openDoc({ page, harness, docName: testDocName, appURL });
    t.ok(
      page.url().endsWith(slugifiedDocName.toLowerCase()),
      "Navigated to the document's page.",
    );
  } catch (error) {
    t.fail(`Error opening doc: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

module.exports = { uploadTest, deleteDocTest, openDocTest };
