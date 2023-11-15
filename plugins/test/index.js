// netlify plugin to run playwright on deploy previews

export async function onSuccess({ utils }) {
  console.log("Installing Playwright dependencies");
  await utils.run("playwright", ["install"]).catch((err) => {
    utils.build.failBuild(err);
  });

  console.log("Running Playwright tests");
  result = await utils.run("playwright", ["test"]).catch((err) => {
    utils.build.failBuild(err);
  });

  utils.status.show({
    title: "Playwright tests completed.",
  });
}
