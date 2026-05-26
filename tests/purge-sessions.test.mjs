import { mkdtemp, mkdir, readFile, rm, writeFile, utimes } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";

const cliPath = resolve(
  process.cwd(),
  "bin/antigravity-lgpd.js",
);

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
  });
}

async function createTempProject(prefix) {
  const baseTmp = tmpdir();
  await mkdir(baseTmp, { recursive: true });
  return mkdtemp(join(baseTmp, prefix));
}

test("purge-sessions returns success when .agent/memory.md is missing", async () => {
  const projectDir = await createTempProject("agsp-purge-nomem-");

  try {
    const result = runCli(["purge-sessions"], projectDir);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /No memory.md found/);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("purge-sessions uses default retention when log_retention_days is missing", async () => {
  const projectDir = await createTempProject("agsp-purge-default-");

  try {
    await mkdir(join(projectDir, ".agent"), { recursive: true });
    await writeFile(join(projectDir, ".agent", "memory.md"), "# Memory\nNo retention config here.");
    await mkdir(join(projectDir, ".agent", "sessions"), { recursive: true });

    const result = runCli(["purge-sessions"], projectDir);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Defaulting to 30 days/);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("purge-sessions removes old files and preserves recent ones", async () => {
  const projectDir = await createTempProject("agsp-purge-logic-");

  try {
    await mkdir(join(projectDir, ".agent", "sessions"), { recursive: true });
    // Set retention to 7 days
    await writeFile(join(projectDir, ".agent", "memory.md"), "log_retention_days: 7");

    const now = Date.now();
    const oneDayAgo = (now - (1 * 24 * 60 * 60 * 1000)) / 1000;
    const tenDaysAgo = (now - (10 * 24 * 60 * 60 * 1000)) / 1000;

    const recentFile = join(projectDir, ".agent", "sessions", "recent.md");
    const oldFile = join(projectDir, ".agent", "sessions", "old.md");
    const nonMdFile = join(projectDir, ".agent", "sessions", "old.txt");

    await writeFile(recentFile, "recent");
    await utimes(recentFile, oneDayAgo, oneDayAgo);

    await writeFile(oldFile, "# Architecture Decision\nDecision: keep API adapter isolated from core use cases.");
    await utimes(oldFile, tenDaysAgo, tenDaysAgo);

    await writeFile(nonMdFile, "non-md");
    await utimes(nonMdFile, tenDaysAgo, tenDaysAgo);

    const result = runCli(["purge-sessions"], projectDir);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Summarized 1 old session files into memory\.md/);
    assert.match(result.stdout, /Purged 1 session files/);

    // Check files
    const { accessSync, constants } = await import("node:fs");
    const checkExists = (p) => {
        try { accessSync(p, constants.F_OK); return true; } catch { return false; }
    };

    assert.strictEqual(checkExists(recentFile), true, "Recent file should exist");
    assert.strictEqual(checkExists(oldFile), false, "Old file should be purged");
    assert.strictEqual(checkExists(nonMdFile), true, "Non-md file should be ignored");

    const memory = await readFile(join(projectDir, ".agent", "memory.md"), "utf8");
    assert.match(memory, /Archived Session Summaries/);
    assert.match(memory, /old\.md/);
    assert.match(memory, /API adapter isolated/);

  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});
