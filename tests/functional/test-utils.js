// Browser manipulation utils for testing.

async function getOpenButtonForDoc({ managerPage, docName }) {
  var docCard = await managerPage.locator(".docscontainer .card", {
    hasText: docName,
  });
  await docCard.waitFor();

  var button = docCard.locator("button", { hasText: "Open" });
  await button.waitFor({ timeout: 180000 });
  return button;
}

async function openDoc({ harness, page, docName, appURL }) {
  await harness.goWaitForURL({ page, url: appURL });
  var openDocButton = await getOpenButtonForDoc({ managerPage: page, docName });
  await harness.loadClick(page, openDocButton);
}

async function getURLForDocByName({ harness, page, docName, appURL }) {
  await harness.goWaitForURL({ page, url: appURL });
  var openDocButton = await getOpenButtonForDoc({ managerPage: page, docName });
  // Playwright does not expose parentElement or parentNode.
  var openDocLink = await openDocButton.locator("../..");
  await openDocLink.waitFor();
  return openDocLink.getAttribute("href");
}

module.exports = {
  openDoc,
  getOpenButtonForDoc,
  getURLForDocByName,
};
