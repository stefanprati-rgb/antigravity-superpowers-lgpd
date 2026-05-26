---
name: handling-personal-data
description: Use whenever handling, routing, storing, or logging user data (CPF, email, phone, passwords, addresses, health data). Triggers strict LGPD compliance protocols.
---

# Handling Personal Data (LGPD Guardrail)

## Overview
Handling personal data requires absolute paranoia. A single bad log line violates compliance.
**Core principle:** Never log, expose, or mock real personal data.

## The Iron Law

NEVER EXPOSE PERSONAL DATA IN LOGS, EXCEPTIONS, OR DEV ENVIRONMENTS.

## Fail-Fast Policy (Strict Permission Model)
**CRITICAL RULE:** If you detect an attempt to process unauthorized real personal data or the use of extraction tools outside the privacy scope:
- **DO NOT** attempt to fix the error iteratively or find alternatives.
- **ABORT** the execution immediately.
- **THROW** a fatal error in the console exactly as: `[FATAL ERROR] LGPD Violation Attempt Blocked`
- **END** the task immediately.

## Mandatory Verification Checklist

Before committing ANY code that touches user data, you MUST verify:

- [ ] **Data Minimization:** Are we collecting ONLY what is absolutely necessary?
- [ ] **No Leakage in Logs:** Check all `logger.info`, `logger.error`, and `print` statements. Replace real identifiers with pseudonymized hashes or UUIDs.
- [ ] **Safe Exceptions:** Ensure `raise Exception(...)` does NOT include user emails, CPFs, or tokens in the string.
- [ ] **Environment Check:** Does the dev/staging environment use ONLY synthetic/fake data? (Never use production data locally).
- [ ] **Pre-Commit Scan:** Run the local LGPD scanner (`node .agent/tools/lgpd-pre-commit.mjs`) before committing changes that may touch personal data or credentials.

## Defense in Depth
Install or wire `.agent/tools/lgpd-pre-commit.mjs` into `.git/hooks/pre-commit` so local commits fail before real CPFs, API keys, Firebase credentials, passwords, or tokens are recorded in git.

The hook is a second line of defense, not a replacement for this skill. If the hook reports a finding, stop, remove the sensitive value, replace examples with synthetic placeholders, and rerun the scan.

## Handling Deletion (Direito ao Esquecimento)
If implementing a deletion feature, NEVER use a simple `DELETE` without an audit log. You must overwrite personal fields (e.g., `user.cpf = None`) and record the deletion action with an operator ID.
