#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const inputPath = resolve(process.argv[2] || "docs/plans/task.json");
const outputPath = resolve(process.argv[3] || "docs/plans/task.md");

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const tracker = JSON.parse(await readFile(inputPath, "utf8"));
const rows = Array.isArray(tracker.tasks) ? tracker.tasks : [];
const markdown = [
  "| id | task | status | notes |",
  "| --- | --- | --- | --- |",
  ...rows.map((task) => `| ${escapeCell(task.id)} | ${escapeCell(task.task)} | ${escapeCell(task.status)} | ${escapeCell(task.notes)} |`),
  "",
].join("\n");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, markdown, "utf8");
process.stdout.write(`Rendered ${outputPath}\n`);
