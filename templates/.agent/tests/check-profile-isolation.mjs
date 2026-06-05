#!/usr/bin/env node

/**
 * check-profile-isolation.mjs — Verifies that generated agent profiles
 * contain only their agent-specific instructions and no cross-contamination.
 *
 * Exit code: 0 = all checks pass, 1 = isolation violations found.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const agentDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = resolve(agentDir, "..");

let passCount = 0;
let failCount = 0;

function pass(msg) {
  process.stdout.write(`  [PASS] ${msg}\n`);
  passCount++;
}

function fail(msg) {
  process.stderr.write(`  [FAIL] ${msg}\n`);
  failCount++;
}

function checkAbsent(content, pattern, fileName, label) {
  if (pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern)) {
    fail(`${fileName} contains ${label} (cross-contamination)`);
  } else {
    pass(`${fileName} does NOT contain ${label}`);
  }
}

function checkPresent(content, pattern, fileName, label) {
  if (pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern)) {
    pass(`${fileName} contains ${label}`);
  } else {
    fail(`${fileName} missing ${label}`);
  }
}

process.stdout.write("\n========================================\n");
process.stdout.write(" Profile Isolation Checks\n");
process.stdout.write("========================================\n\n");

// --- Check templates exist ---

process.stdout.write("Checking templates...\n");

const requiredTemplates = [
  "profiles/shared/core-rules.md",
  "profiles/codex/agent-profile.md",
  "profiles/codex/config.toml",
  "profiles/gemini/agent-profile.md",
  "profiles/gemini/settings.json",
  "profiles/gemini/aiexclude",
  "profiles/claude/agent-profile.md",
  "profiles/claude/settings.json",
];

for (const tpl of requiredTemplates) {
  const path = resolve(agentDir, tpl);
  if (existsSync(path)) {
    pass(`Template exists: ${tpl}`);
  } else {
    fail(`Template missing: ${tpl}`);
  }
}

// --- Check generated files if they exist ---

process.stdout.write("\nChecking generated profiles for isolation...\n");

const agentsPath = resolve(rootDir, "AGENTS.md");
const geminiPath = resolve(rootDir, "GEMINI.md");
const claudePath = resolve(rootDir, "CLAUDE.md");

// Codex AGENTS.md — must NOT contain Gemini/Claude-specific terms
if (existsSync(agentsPath)) {
  const codex = readFileSync(agentsPath, "utf8");

  process.stdout.write("\n  --- AGENTS.md (Codex) isolation ---\n");

  // Must be present (shared core)
  checkPresent(codex, "LGPD", "AGENTS.md", "LGPD guardrail");
  checkPresent(codex, "docs/plans/task.json", "AGENTS.md", "task tracking");
  checkPresent(codex, ".agent/skills/", "AGENTS.md", "skill loading");
  checkPresent(codex, "uv", "AGENTS.md", "uv environment");
  checkPresent(codex, "Codex", "AGENTS.md", "Codex identifier");

  // Must NOT be present (Gemini-specific)
  checkAbsent(codex, "view_file", "AGENTS.md", "Gemini tool: view_file");
  checkAbsent(codex, "browser_subagent", "AGENTS.md", "Gemini tool: browser_subagent");
  checkAbsent(codex, /~\/\.gemini/, "AGENTS.md", "Gemini path: ~/.gemini");
  checkAbsent(codex, "Planning Mode", "AGENTS.md", "Gemini feature: Planning Mode");
  checkAbsent(codex, "Fast Mode", "AGENTS.md", "Gemini feature: Fast Mode");
  checkAbsent(codex, "<rules>", "AGENTS.md", "Gemini XML: <rules>");
  checkAbsent(codex, "<constraints>", "AGENTS.md", "Gemini XML: <constraints>");

  // Must NOT be present (Claude-specific)
  checkAbsent(codex, "TodoWrite", "AGENTS.md", "Claude tool: TodoWrite");
  checkAbsent(codex, "review gates", "AGENTS.md", "Claude feature: review gates");
} else {
  process.stdout.write("  [INFO] AGENTS.md not generated, skipping Codex isolation checks.\n");
}

// Gemini GEMINI.md — must NOT contain Codex/Claude-specific terms
if (existsSync(geminiPath)) {
  const gemini = readFileSync(geminiPath, "utf8");

  process.stdout.write("\n  --- GEMINI.md isolation ---\n");

  // Must be present (shared core)
  checkPresent(gemini, "LGPD", "GEMINI.md", "LGPD guardrail");
  checkPresent(gemini, "docs/plans/task.json", "GEMINI.md", "task tracking");
  checkPresent(gemini, ".agent/skills/", "GEMINI.md", "skill loading");
  checkPresent(gemini, "Gemini", "GEMINI.md", "Gemini identifier");

  // Must be present (Gemini-specific)
  checkPresent(gemini, "view_file", "GEMINI.md", "Gemini tool: view_file");
  checkPresent(gemini, "browser_subagent", "GEMINI.md", "Gemini tool: browser_subagent");
  checkPresent(gemini, "Planning Mode", "GEMINI.md", "Planning Mode");

  // Must NOT be present (Codex-specific)
  checkAbsent(gemini, "batch-optimized", "GEMINI.md", "Codex term: batch-optimized");
  checkAbsent(gemini, "Network is disabled", "GEMINI.md", "Codex constraint: Network disabled");
  checkAbsent(gemini, "CLI/Sandbox", "GEMINI.md", "Codex term: CLI/Sandbox");

  // Must NOT be present (Claude-specific)
  checkAbsent(gemini, "TodoWrite", "GEMINI.md", "Claude tool: TodoWrite");
  checkAbsent(gemini, "review gates", "GEMINI.md", "Claude feature: review gates");
} else {
  process.stdout.write("  [INFO] GEMINI.md not generated, skipping Gemini isolation checks.\n");
}

// Claude CLAUDE.md — must NOT contain Codex/Gemini-specific terms
if (existsSync(claudePath)) {
  const claude = readFileSync(claudePath, "utf8");

  process.stdout.write("\n  --- CLAUDE.md isolation ---\n");

  // Must be present (shared core)
  checkPresent(claude, "LGPD", "CLAUDE.md", "LGPD guardrail");
  checkPresent(claude, "docs/plans/task.json", "CLAUDE.md", "task tracking");
  checkPresent(claude, ".agent/skills/", "CLAUDE.md", "skill loading");
  checkPresent(claude, "Claude", "CLAUDE.md", "Claude identifier");

  // Must be present (Claude-specific)
  checkPresent(claude, "TodoWrite", "CLAUDE.md", "Claude tool: TodoWrite");
  checkPresent(claude, /review gates/i, "CLAUDE.md", "review gates");

  // Must NOT be present (Codex-specific)
  checkAbsent(claude, "batch-optimized", "CLAUDE.md", "Codex term: batch-optimized");
  checkAbsent(claude, "Network is disabled", "CLAUDE.md", "Codex constraint: Network disabled");
  checkAbsent(claude, "CLI/Sandbox", "CLAUDE.md", "Codex term: CLI/Sandbox");

  // Must NOT be present (Gemini-specific)
  checkAbsent(claude, "view_file", "CLAUDE.md", "Gemini tool: view_file");
  checkAbsent(claude, "browser_subagent", "CLAUDE.md", "Gemini tool: browser_subagent");
  checkAbsent(claude, "Planning Mode", "CLAUDE.md", "Gemini feature: Planning Mode");
  checkAbsent(claude, "<rules>", "CLAUDE.md", "Gemini XML: <rules>");
  checkAbsent(claude, "<constraints>", "CLAUDE.md", "Gemini XML: <constraints>");
} else {
  process.stdout.write("  [INFO] CLAUDE.md not generated, skipping Claude isolation checks.\n");
}

// --- Check core-rules placeholder is resolved ---

process.stdout.write("\nChecking placeholder resolution...\n");

for (const [name, path] of [
  ["AGENTS.md", agentsPath],
  ["GEMINI.md", geminiPath],
  ["CLAUDE.md", claudePath],
]) {
  if (existsSync(path)) {
    const content = readFileSync(path, "utf8");
    checkAbsent(content, "{core-rules}", name, "unresolved {core-rules} placeholder");
  }
}

// --- Summary ---

process.stdout.write("\n========================================\n");
process.stdout.write(" Summary\n");
process.stdout.write("========================================\n");
process.stdout.write(`  Passed: ${passCount}\n`);
process.stdout.write(`  Failed: ${failCount}\n`);
process.stdout.write("\n");

if (failCount > 0) {
  process.stdout.write("STATUS: FAILED\n");
  process.exit(1);
}

process.stdout.write("STATUS: PASSED\n");
