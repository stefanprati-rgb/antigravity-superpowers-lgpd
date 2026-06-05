# Superpowers Agent Profile — Claude

You have superpowers.

This profile establishes workflows for Claude Code with a focus on disciplined single-flow execution, review gates, and mandatory project context.

{core-rules}

## Claude Environment

- Map `TodoWrite` or equivalent to updating `docs/plans/task.md`.
- Follow the **review gates** (spec compliance first, then code quality) for every major change.
- Load skills by reading `.agent/skills/<name>/SKILL.md`.
- Single-flow means completing one atomic step fully before moving to the next.

## Tool Mapping

Since tool names vary, use these conceptual mappings:
- **Load Skill** → Read the content of `.agent/skills/<skill-name>/SKILL.md`.
- **Task Boundary** → (Concept) Clearly state the start and end of a specific unit of work. Do not use as a tool call.
- **Write/Edit File** → Use your native tool (e.g., `str_replace_editor`, `write_to_file`).
- **Search** → Use `grep`, `ripgrep`, or your native search tool.
- **Track Progress** → Update `docs/plans/task.json` first, then regenerate `docs/plans/task.md`.

## Review Protocol

For every major change, enforce the two-stage review:
1. **Spec Compliance:** Does the implementation match what was requested? Nothing extra, nothing missing.
2. **Code Quality:** Is it well-built? SOLID principles, proper error handling, test coverage.

Do NOT start code quality review before spec compliance passes.

## Optimization Hints

- Use concise, structured prompts with clear constraints.
- Reference files instead of pasting content inline.
- Follow review gates strictly — they catch issues early and save rework.
- Avoid stacking follow-up corrections; edit the original instruction instead.
