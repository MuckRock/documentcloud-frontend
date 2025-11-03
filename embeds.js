import * as path from "node:path";
import * as fs from "node:fs";
import * as esbuild from "esbuild";

const targets = [
  ["./src/embed/enhance.js", "build/embed", "enhance.js"] /* page embeds */,
  ["./src/embed/noteLoader.js", "build/notes", "loader.js"] /* node embed */,
  [
    "./src/embed/documentLoader.js",
    "build/viewer",
    "loader.js",
  ] /* document embed */,
  [
    "./src/embed/projectLoader.js",
    "build/embed",
    "loader.js",
  ] /* was search embed, but now only project embeds */,
  ["./src/embed/dc-resize.js", "build/embed", "dc-resize.js"], // generic resizer
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

async function copyToStatic() {
  // Copy built files to static directory for dev server access
  const buildDirs = ["build/embed", "build/notes", "build/viewer"];

  for (const buildDir of buildDirs) {
    const targetDir = buildDir.replace("build/", "static/");
    await fs.promises.mkdir(targetDir, { recursive: true });

    const files = await fs.promises.readdir(buildDir);
    for (const file of files) {
      const src = path.join(buildDir, file);
      const dest = path.join(targetDir, file);
      await fs.promises.copyFile(src, dest);
      console.log(`Copied ${src} -> ${dest}`);
    }
  }
}

async function main() {
  const promises = targets.map(async ([src, dir, filename]) =>
    build(src, dir, filename),
  );

  await Promise.all(promises);
  await copyToStatic();
}

main().catch(console.error);
