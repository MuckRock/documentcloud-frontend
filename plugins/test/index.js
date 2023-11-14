// netlify plugin to run playwright on deploy previews

export async function onSuccess({ utils }) {
  await utils.run("playwright", ["install"]);
  await utils.run("playwright", ["test"]);
}
