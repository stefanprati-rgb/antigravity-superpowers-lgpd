import { mkdtemp, mkdir, rm, cp, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";

const cliPath = resolve(
  process.cwd(),
  "bin/antigravity-lgpd.js",
);

const templateDir = resolve(
  process.cwd(),
  "templates/.agent"
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

test("doctor returns code 1 when .agent is missing", async () => {
  const projectDir = await createTempProject("agsp-doctor-missing-");

  try {
    const result = runCli(["doctor"], projectDir);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /directory not found/i);
    assert.match(result.stdout, /Run 'antigravity-lgpd init'/);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("doctor returns code 0 and HEALTHY when profile is valid", async () => {
  const projectDir = await createTempProject("agsp-doctor-healthy-");

  try {
    // Mock a healthy profile by copying templates
    await mkdir(join(projectDir, ".agent"), { recursive: true });
    await cp(templateDir, join(projectDir, ".agent"), { recursive: true });
    
    // Create required runtime tracker to avoid warnings
    await mkdir(join(projectDir, "docs", "plans"), { recursive: true });
    await writeFile(
      join(projectDir, "docs", "plans", "task.json"),
      JSON.stringify({ version: 1, tasks: [] }),
    );
    
    // Create project.md
    await writeFile(join(projectDir, ".agent", "project.md"), "# Project");

    const result = runCli(["doctor"], projectDir);
    
    // If there are still warnings (e.g. Node version if running on old node), 
    // it might return 1. But for this test we expect 0 if we mock everything.
    assert.equal(result.status, 0, `Doctor failed: ${result.stdout}`);
    assert.match(result.stdout, /STATUS: HEALTHY/);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});
