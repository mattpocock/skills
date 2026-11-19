// Parses every SKILL.md's frontmatter with `yaml`, the parser the `skills`
// installer uses, so a skill that would be skipped on install fails here first.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { parseDocument } from "yaml";

const root = new URL("..", import.meta.url).pathname;

function* skillFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* skillFiles(path);
    else if (entry.name === "SKILL.md") yield path;
  }
}

const failures = [];

for (const file of skillFiles(join(root, "skills"))) {
  const where = relative(root, file);
  const match = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    failures.push(`${where}: no frontmatter block`);
    continue;
  }
  const doc = parseDocument(match[1], { strict: true, uniqueKeys: true });
  if (doc.errors.length > 0) {
    failures.push(`${where}: ${doc.errors[0].message.split("\n")[0]}`);
    continue;
  }
  const data = doc.toJS();
  for (const key of ["name", "description"]) {
    if (typeof data?.[key] !== "string" || data[key].trim() === "") {
      failures.push(`${where}: missing \`${key}\``);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  console.error(
    `\n${failures.length} SKILL.md frontmatter error(s). Quote any value containing ": " or starting with a YAML indicator character.`,
  );
  process.exit(1);
}
console.log("All SKILL.md frontmatter parses.");
