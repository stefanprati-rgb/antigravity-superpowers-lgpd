#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const staged = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
  encoding: "utf8",
});

if (staged.status !== 0) {
  process.stderr.write("[LGPD] Unable to list staged files.\n");
  process.exit(1);
}

const fileNames = staged.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => !/\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|lock)$/i.test(file));

const patterns = [
  { label: "CPF-like value", regex: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
  { label: "email address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { label: "Google API key", regex: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { label: "generic secret assignment", regex: /\b(api[_-]?key|secret|token|password|passwd|private[_-]?key)\b\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { label: "Firebase private key", regex: /-----BEGIN PRIVATE KEY-----|firebase_adminsdk|serviceAccount/i },
];

const findings = [];

for (const file of fileNames) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { label, regex } of patterns) {
    if (regex.test(content)) {
      findings.push(`${file}: ${label}`);
    }
  }
}

if (findings.length > 0) {
  process.stderr.write("[FATAL ERROR] LGPD Violation Attempt Blocked\n");
  for (const finding of findings) {
    process.stderr.write(`  - ${finding}\n`);
  }
  process.exit(1);
}

process.stdout.write("[LGPD] Pre-commit scan passed.\n");
