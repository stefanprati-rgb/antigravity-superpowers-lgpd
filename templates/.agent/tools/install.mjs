#!/usr/bin/env node

/**
 * install.mjs — Multi-agent profile installer for Superpowers
 *
 * Generates agent-optimized configuration files at the project root.
 * Each agent gets only the instructions relevant to it.
 *
 * Usage:
 *   node .agent/tools/install.mjs --codex          # Codex only
 *   node .agent/tools/install.mjs --gemini         # Gemini only
 *   node .agent/tools/install.mjs --claude         # Claude only
 *   node .agent/tools/install.mjs --codex --gemini # Codex + Gemini
 *   node .agent/tools/install.mjs                  # All agents (default)
 *   node .agent/tools/install.mjs --force          # Overwrite existing files
 *   node .agent/tools/install.mjs --clean          # Remove generated files
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// --- Path resolution ---

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const AGENT_DIR = resolve(SCRIPT_DIR, "..");
const ROOT_DIR = resolve(AGENT_DIR, "..");
const PROFILES_DIR = resolve(AGENT_DIR, "profiles");

// --- CLI argument parsing ---

const args = process.argv.slice(2);
const flags = new Set(args.map((a) => a.toLowerCase()));

const wantsCodex = flags.has("--codex");
const wantsGemini = flags.has("--gemini");
const wantsClaude = flags.has("--claude");
const force = flags.has("--force");
const clean = flags.has("--clean");
const help = flags.has("--help") || flags.has("-h");

// If no agent flags specified, install all
const installAll = !wantsCodex && !wantsGemini && !wantsClaude;
const doCodex = installAll || wantsCodex;
const doGemini = installAll || wantsGemini;
const doClaude = installAll || wantsClaude;

// --- Help ---

if (help) {
  process.stdout.write(`
Superpowers Multi-Agent Profile Installer

Usage:
  node .agent/tools/install.mjs [options]

Agent Flags (combine as needed):
  --codex     Generate Codex-optimized AGENTS.md + .codex/config.toml
  --gemini    Generate Gemini-optimized GEMINI.md + .gemini/settings.json + .aiexclude
  --claude    Generate Claude-optimized CLAUDE.md + .claude/settings.json

  If no agent flags are given, ALL profiles are installed.

Options:
  --force     Overwrite existing generated files
  --clean     Remove all generated profile files
  --help, -h  Show this help message

Examples:
  node .agent/tools/install.mjs --codex            # Codex only
  node .agent/tools/install.mjs --gemini --claude   # Gemini + Claude
  node .agent/tools/install.mjs                     # All agents
  node .agent/tools/install.mjs --clean             # Remove generated files
`);
  process.exit(0);
}

// --- Utility functions ---

function readTemplate(relativePath) {
  const fullPath = resolve(PROFILES_DIR, relativePath);
  if (!existsSync(fullPath)) {
    process.stderr.write(`[ERROR] Template not found: ${fullPath}\n`);
    process.exit(1);
  }
  return readFileSync(fullPath, "utf8");
}

function writeGenerated(relativePath, content) {
  const fullPath = resolve(ROOT_DIR, relativePath);
  const dir = dirname(fullPath);

  if (existsSync(fullPath) && !force) {
    process.stdout.write(`  [SKIP] ${relativePath} (already exists, use --force to overwrite)\n`);
    return false;
  }

  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content, "utf8");
  process.stdout.write(`  [WRITE] ${relativePath}\n`);
  return true;
}

function removeGenerated(relativePath) {
  const fullPath = resolve(ROOT_DIR, relativePath);
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true });
    process.stdout.write(`  [REMOVE] ${relativePath}\n`);
  }
}

function buildProfile(agentTemplateRelPath) {
  const coreRules = readTemplate("shared/core-rules.md");
  const agentTemplate = readTemplate(agentTemplateRelPath);
  return agentTemplate.replace("{core-rules}", coreRules);
}

// --- Clean mode ---

if (clean) {
  process.stdout.write("\n=== Cleaning generated profile files ===\n\n");

  // Codex
  removeGenerated("AGENTS.md");
  removeGenerated(".codex");

  // Gemini
  removeGenerated("GEMINI.md");
  removeGenerated(".gemini");
  removeGenerated(".aiexclude");

  // Claude
  removeGenerated("CLAUDE.md");
  removeGenerated(".claude");

  process.stdout.write("\n[DONE] All generated profile files removed.\n");
  process.exit(0);
}

// --- Install mode ---

process.stdout.write("\n========================================\n");
process.stdout.write(" Superpowers Multi-Agent Installer\n");
process.stdout.write("========================================\n\n");

const agents = [];
if (doCodex) agents.push("Codex");
if (doGemini) agents.push("Gemini");
if (doClaude) agents.push("Claude");
process.stdout.write(`Installing profiles for: ${agents.join(", ")}\n`);
if (force) process.stdout.write("Mode: --force (overwrite existing)\n");
process.stdout.write("\n");

let filesWritten = 0;
let filesSkipped = 0;

function track(written) {
  if (written) filesWritten++;
  else filesSkipped++;
}

// --- Codex ---

if (doCodex) {
  process.stdout.write("--- Codex Profile ---\n");
  const profile = buildProfile("codex/agent-profile.md");
  track(writeGenerated("AGENTS.md", profile));

  const configToml = readTemplate("codex/config.toml");
  track(writeGenerated(".codex/config.toml", configToml));
  process.stdout.write("\n");
}

// --- Gemini ---

if (doGemini) {
  process.stdout.write("--- Gemini Profile ---\n");
  const profile = buildProfile("gemini/agent-profile.md");
  track(writeGenerated("GEMINI.md", profile));

  const settingsJson = readTemplate("gemini/settings.json");
  track(writeGenerated(".gemini/settings.json", settingsJson));

  const aiexclude = readTemplate("gemini/aiexclude");
  track(writeGenerated(".aiexclude", aiexclude));
  process.stdout.write("\n");
}

// --- Claude ---

if (doClaude) {
  process.stdout.write("--- Claude Profile ---\n");
  const profile = buildProfile("claude/agent-profile.md");
  track(writeGenerated("CLAUDE.md", profile));

  const settingsJson = readTemplate("claude/settings.json");
  track(writeGenerated(".claude/settings.json", settingsJson));
  process.stdout.write("\n");
}

// --- Summary ---

process.stdout.write("========================================\n");
process.stdout.write(" Summary\n");
process.stdout.write("========================================\n");
process.stdout.write(`  Written: ${filesWritten}\n`);
process.stdout.write(`  Skipped: ${filesSkipped}\n`);
process.stdout.write(`  Agents:  ${agents.join(", ")}\n`);
process.stdout.write("\n");

if (filesWritten > 0) {
  process.stdout.write("Generated files:\n");
  if (doCodex) {
    process.stdout.write("  Codex:  AGENTS.md, .codex/config.toml\n");
  }
  if (doGemini) {
    process.stdout.write("  Gemini: GEMINI.md, .gemini/settings.json, .aiexclude\n");
  }
  if (doClaude) {
    process.stdout.write("  Claude: CLAUDE.md, .claude/settings.json\n");
  }
  process.stdout.write("\n");
}

process.stdout.write("[DONE] Profile installation complete.\n");
