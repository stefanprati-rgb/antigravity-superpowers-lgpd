import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const raw = execFileSync("npm", ["pack", "--json"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
const packResult = JSON.parse(raw);

if (!Array.isArray(packResult) || packResult.length === 0) {
  throw new Error("npm pack did not return package metadata");
}

const [{ filename, files }] = packResult;
if (!filename || !Array.isArray(files)) {
  throw new Error("npm pack output is missing filename or files");
}

const packagedPaths = new Set(files.map((file) => file.path));
const required = [
  "bin/antigravity-superpowers.js",
  "src/cli.js",
  "src/commands/init.js",
  "templates/.agent/AGENTS.md",
  "templates/.agent/INSTALL.md",
  "templates/.agent/task.md",
  "templates/.agent/workflows/brainstorm.md",
  "templates/.agent/workflows/write-plan.md",
  "templates/.agent/workflows/execute-plan.md",
  "templates/.agent/agents/code-reviewer.md",
  "templates/.agent/tests/run-tests.sh",
  "templates/.agent/tests/check-antigravity-profile.sh",
  "templates/.agent/skills/single-flow-task-execution/SKILL.md",
  "templates/.agent/skills/single-flow-task-execution/implementer-prompt.md",
  "templates/.agent/skills/single-flow-task-execution/spec-reviewer-prompt.md",
  "templates/.agent/skills/single-flow-task-execution/code-quality-reviewer-prompt.md",
  "templates/.agent/skills/executing-plans/SKILL.md",
  "templates/.agent/skills/verification-before-completion/SKILL.md",
  "templates/.agent/skills/writing-plans/SKILL.md",
  "templates/.agent/skills/test-driven-development/SKILL.md",
  "templates/.agent/skills/project-onboarding/SKILL.md",
  "templates/.agent/skills/handling-personal-data/SKILL.md"
];

const missing = required.filter((path) => !packagedPaths.has(path));
if (missing.length > 0) {
  throw new Error(
    `Packaged tarball is missing required files: ${missing.join(", ")}`,
  );
}

await rm(resolve(process.cwd(), filename), { force: true });

process.stdout.write("Pack smoke check passed.\n");