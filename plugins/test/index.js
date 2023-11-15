// netlify plugin to run playwright on deploy previews

export async function onSuccess({ utils }) {
  console.log("Installing Playwright dependencies");
  await utils.run("playwright", ["install", "--with-deps", "chromium"]);

  console.log("Running Playwright tests");
  await utils.run("playwright", ["test"]);

  console.log("Done.");
}
