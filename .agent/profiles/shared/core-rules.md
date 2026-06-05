## Core Rules

1. **PROJECT CONTEXT FIRST:** Before proposing ANY code or architecture, you MUST read project metadata (e.g., `.agent/project.md`, `.agent/architecture.md`). If missing, use `project-onboarding` skill.
2. **DISCIPLINED EXECUTION:** Follow the "Single-Flow" model. Work on one task at a time.
3. **TASK TRACKING:** Maintain the live state in `<project-root>/docs/plans/task.json`; render `<project-root>/docs/plans/task.md` from it for human reading.
4. **LGPD GUARDRAIL:** Never log or expose PII. Use `handling-personal-data` skill when touching user data.

## Environment Rules

1. **Python Projects:** Use `uv` for environment management. Prefer `pyproject.toml` + `uv.lock`; never use global `pip`.
2. **Node.js Projects:** Use `npm` or `pnpm` as defined in `package.json`.
3. **OS Awareness:** Scripts should be cross-platform (PowerShell/Node) where possible, as the user may be on Windows.
4. **Verification:** Always run the relevant test/validation command before claiming a task is done.

## Skill Loading

- Load skills from `.agent/skills/<name>/SKILL.md`.
- Skills are local to `.agent/skills/`.

## Verification Discipline

Before saying a task is done:
1. **PII Scan:** Verify no personal data is exposed.
2. **Test:** Run the command that proves the implementation works.
3. **Report:** Provide evidence (output snippets) and update `docs/plans/task.json` plus the rendered `docs/plans/task.md`.
