import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

const cliPath = resolve(process.cwd(), "bin/antigravity-lgpd.js");

function runCli(args, cwd) {
    return spawnSync(process.execPath, [cliPath, ...args], {
        cwd: cwd || process.cwd(),
        encoding: "utf8",
    });
}

test("cli shows help with --help", () => {
    const result = runCli(["--help"]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /antigravity-lgpd/);
    assert.match(result.stdout, /init/);
    assert.match(result.stdout, /validate/);
    assert.match(result.stdout, /--force/);
    assert.match(result.stdout, /--dry-run/);
});

test("cli shows help with no arguments", () => {
    const result = runCli([]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /antigravity-lgpd/);
});

test("cli shows help with 'help' command", () => {
    const result = runCli(["help"]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /antigravity-lgpd/);
});

test("cli returns error for unknown command", () => {
    const result = runCli(["foobar"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown command: foobar/);
});
