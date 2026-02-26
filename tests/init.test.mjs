import { mkdtemp, mkdir, rm, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";

const cliPath = resolve(
  process.cwd(),
  "bin/antigravity-superpowers.js",
);

async function pathExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

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

test("init creates .agent in a fresh project", async () => {
  const projectDir = await createTempProject("agsp-fresh-");

  try {
    const result = runCli(["init"], projectDir);
    assert.equal(result.status, 0);

    const hasAgent = await pathExists(join(projectDir, ".agent", "AGENTS.md"));
    assert.equal(hasAgent, true);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("init fails when .agent exists without --force", async () => {
  const projectDir = await createTempProject("agsp-existing-");

  try {
    await mkdir(join(projectDir, ".agent"), { recursive: true });

    const result = runCli(["init"], projectDir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /already exists/i);
    assert.match(result.stderr, /--force/i);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("init replaces .agent with --force", async () => {
  const projectDir = await createTempProject("agsp-force-");

  try {
    await mkdir(join(projectDir, ".agent"), { recursive: true });

    const result = runCli(["init", "--force"], projectDir);
    assert.equal(result.status, 0);

    const hasTemplate = await pathExists(join(projectDir, ".agent", "AGENTS.md"));
    assert.equal(hasTemplate, true);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});
