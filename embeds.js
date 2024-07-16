import * as path from "node:path";
import * as esbuild from "esbuild";

const targets = [
  ["./src/embed/enhance.js", "static/embed", "enhance.js"] /* page embeds */,
  ["./src/embed/noteLoader.js", "static/notes", "loader.js"] /* node embed */,
  [
    "./src/embed/documentLoader.js",
    "static/viewer",
    "loader.js",
  ] /* document embed */,
  [
    "./src/embed/projectLoader.js",
    "static/embed",
    "loader.js",
  ] /* was search embed, but now only project embeds */,
];

async function build(src, dir, filename) {
  return esbuild.build({
    entryPoints: [src],
    bundle: true,
    outfile: path.join(dir, filename),
    platform: "browser",
    format: "iife",
    logLevel: "info",
    treeShaking: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "production",
      ),
      "process.env.DEPLOY_PRIME_URL": JSON.stringify(
        process.env.DEPLOY_PRIME_URL ?? "",
      ),
    },
  });
}

async function main() {
  const promises = targets.map(async ([src, dir, filename]) =>
    build(src, dir, filename),
  );

  return Promise.all(promises);
}

main().catch(console.error);
