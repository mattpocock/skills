#!/usr/bin/env node
// Copies package.json's version into every plugin manifest:
//   plugin.json                  — the Agent Plugins 1.0 manifest
//   .claude-plugin/plugin.json   — the Claude Code manifest
// Runs as part of `npm run version`, immediately after `changeset version`.
// With --check it changes nothing and exits 1 if any version differs.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifests = [
  join(repo, "plugin.json"),
  join(repo, ".claude-plugin", "plugin.json"),
];

const { version } = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const check = process.argv.includes("--check");
let failed = false;

for (const path of manifests) {
  const name = relative(repo, path);
  const source = readFileSync(path, "utf8");
  const manifest = JSON.parse(source);

  if (manifest.version === version) {
    console.log(`${name} version is ${version} — already in sync`);
    continue;
  }

  if (check) {
    console.error(
      `${name} version is ${manifest.version}, package.json is ${version}. Run \`node scripts/sync-plugin-version.mjs\`.`,
    );
    failed = true;
    continue;
  }

  // Rewrite only the version line, to keep the key order and the formatting.
  const updated = source.replace(
    /("version"\s*:\s*")[^"]*(")/,
    `$1${version}$2`,
  );

  if (JSON.parse(updated).version !== version) {
    console.error(`Could not find a version field to replace in ${path}.`);
    process.exit(1);
  }

  writeFileSync(path, updated);
  console.log(`${name} version ${manifest.version} -> ${version}`);
}

process.exit(failed ? 1 : 0);
