// netlify plugin to run playwright on deploy previews

export async function onSuccess({ utils }) {
  console.log("Installing Playwright dependencies");
  await utils.run("playwright", ["install"]);

  console.log("Running Playwright tests");
  await utils.run("playwright", ["test"]);

  console.log("Done.");
}
