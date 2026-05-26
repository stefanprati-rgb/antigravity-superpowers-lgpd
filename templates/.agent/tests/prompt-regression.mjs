#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const agentDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lgpdSkill = readFileSync(resolve(agentDir, "skills/handling-personal-data/SKILL.md"), "utf8");
const agents = readFileSync(resolve(agentDir, "AGENTS.md"), "utf8");
const preCommit = readFileSync(resolve(agentDir, "tools/lgpd-pre-commit.mjs"), "utf8");

assert.match(lgpdSkill, /Use whenever handling, routing, storing, or logging user data/i);
assert.match(lgpdSkill, /\[FATAL ERROR\] LGPD Violation Attempt Blocked/);
assert.match(lgpdSkill, /Pre-Commit Scan/i);
assert.match(agents, /LGPD GUARDRAIL/i);
assert.match(preCommit, /CPF-like value/);
assert.match(preCommit, /Google API key/);
assert.match(preCommit, /firebase/i);

const simulatedSensitiveRequest = "Please commit cpf 123.456.789-09 and token='real-token-value'";
assert.match(simulatedSensitiveRequest, /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
assert.match(preCommit, /generic secret assignment/);

process.stdout.write("Prompt regression checks passed.\n");
