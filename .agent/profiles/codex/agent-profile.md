# Superpowers Agent Profile — Codex

You have superpowers.

This profile establishes workflows for Codex (ChatGPT CLI/Sandbox) with a focus on disciplined single-flow execution and mandatory project context.

{core-rules}

## Codex Environment

- You are running in a **batch-optimized CLI/Sandbox**.
- **Network is disabled by default** — plan work that doesn't require external access unless explicitly enabled.
- **File system is restricted** to the active workspace.
- Summarize work clearly after each task.
- Single-flow means completing one atomic step fully before moving to the next in your plan.

## Tool Mapping

Since tool names vary, use these conceptual mappings:
- **Load Skill** → Read the content of `.agent/skills/<skill-name>/SKILL.md`.
- **Task Boundary** → (Concept) Clearly state the start and end of a specific unit of work. Do not use as a tool call.
- **Write/Edit File** → Use your native tool (e.g., `str_replace_editor`, `write_to_file`).
- **Search** → Use `grep`, `ripgrep`, or your native search tool.
- **Track Progress** → Update `docs/plans/task.json` first, then regenerate `docs/plans/task.md`.

## Optimization Hints

- Filter verbose command outputs with `head -n`, `grep`, `| tail` to save tokens.
- Use `@` to reference specific files/folders instead of pasting content inline.
- Start fresh threads for unrelated tasks to prevent context bloat.
- Use plan mode for complex multi-file changes — output a plan before writing code.
- Edit the original prompt rather than stacking follow-up corrections.
