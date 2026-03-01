import { mkdtemp, mkdir, rm, access, cp } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";

const cliPath = resolve(process.cwd(), "bin/antigravity-lgpd.js");
const templateDir = resolve(process.cwd(), "templates/.agent");

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

test("validate fails when no .agent exists", async () => {
    const projectDir = await createTempProject("agsp-val-empty-");

    try {
        const result = runCli(["validate", projectDir], process.cwd());
        assert.equal(result.status, 1);
        assert.match(result.stderr, /No \.agent directory found/);
    } finally {
        await rm(projectDir, { recursive: true, force: true });
    }
});

test("validate passes on complete profile", async () => {
    const projectDir = await createTempProject("agsp-val-full-");

    try {
        // Copy templates to create a valid profile
        await cp(templateDir, join(projectDir, ".agent"), { recursive: true });

        const result = runCli(["validate", projectDir], process.cwd());
        assert.equal(result.status, 0);
        assert.match(result.stdout, /STATUS: PASSED/);
    } finally {
        await rm(projectDir, { recursive: true, force: true });
    }
});

test("validate detects missing skills", async () => {
    const projectDir = await createTempProject("agsp-val-partial-");

    try {
        // Copy templates then remove one skill
        await cp(templateDir, join(projectDir, ".agent"), { recursive: true });
        await rm(join(projectDir, ".agent", "skills", "brainstorming"), {
            recursive: true,
            force: true,
        });

        const result = runCli(["validate", projectDir], process.cwd());
        assert.equal(result.status, 1);
        assert.match(result.stdout, /\[FAIL\]/);
        assert.match(result.stdout, /STATUS: FAILED/);
    } finally {
        await rm(projectDir, { recursive: true, force: true });
    }
});
