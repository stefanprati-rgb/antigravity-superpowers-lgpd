# Superpowers for Antigravity (Custom Edition - UV Powered)

You have superpowers.

This profile adapts Superpowers workflows for Antigravity with strict single-flow execution AND mandatory project context awareness.

## Core Rules

1. **PROJECT CONTEXT FIRST:** Before proposing ANY code or architecture, you MUST read `.agent/project.md`, `.agent/tasks.md`, and `.agent/architecture.md`. If they don't exist, invoke the `project-onboarding` skill.
2. Prefer local skills in `.agent/skills/<skill-name>/SKILL.md`.
3. Execute one core task at a time with `task_boundary`.
4. Use `browser_subagent` only for browser automation tasks.
5. **PERSISTENT MEMORY:** If `.agent/memory.md` exists, you MUST initialize your session log (read yesterday/today's log, append actions) per the `using-superpowers` skill.
6. Track checklist progress in `<project-root>/docs/plans/task.md` (table-only live tracker).
7. Keep changes scoped to the requested task and verify before completion claims.
8. **ISOLATED RUNTIME (UV):** All Python operations MUST happen within a `uv` managed environment. Global `pip` installs are strictly forbidden to prevent environment pollution.

## Tool Translation Contract

When source skills reference legacy tool names, use these Antigravity equivalents:
- Legacy assistant/platform names -> `Antigravity`
- `Task` tool -> `browser_subagent` for browser tasks, otherwise sequential `task_boundary`
- `Skill` tool -> `view_file ~/.gemini/skills/<skill-name>/SKILL.md` (or project-local `.agent/skills/<skill-name>/SKILL.md`)
- `TodoWrite` -> update `<project-root>/docs/plans/task.md` task list
- **Package Management -> Use `uv pip install` for temporary tools or `uv add` for project dependencies**
- **Shell -> `run_command` (WARNING: Never use plain `pip`. Use `uv pip` instead)**
- File operations -> `view_file`, `write_to_file`, `replace_file_content`, `multi_replace_file_content`
- Directory listing -> `list_dir`
- Code structure -> `view_file_outline`, `view_code_item`
- Search -> `grep_search`, `find_by_name`
- Web fetch -> `read_url_content`
- Web search -> `search_web`
- Image generation -> `generate_image`
- User communication during tasks -> `notify_user`
- MCP tools -> `mcp_*` tool family

## Skill Loading

- First preference: project skills at `.agent/skills`.
- Second preference: user skills at `~/.gemini/skills`.
- If both exist, project-local skills win for this profile.

## Single-Flow Execution Model

- Do not dispatch multiple coding agents in parallel.
- Decompose large work into ordered, explicit steps.
- Keep exactly one active task at a time in `<project-root>/docs/plans/task.md`.
- If browser work is required, isolate it in a dedicated browser step.

## Verification Discipline

Before saying a task is done:

1. **LGPD GUARDRAIL:** Verify no personal data (CPF, emails, passwords, etc.) is logged or exposed. Before appending to a session log, pass content through `handling-personal-data` and replace PII with `[REDACTED_LGPD]`.
2. **ENVIRONMENT CHECK:** Confirm that any new dependency was added via `uv` and is present in the local `.venv`.
3. Run the relevant verification command(s).
4. Confirm exit status and key output.
5. Update `<project-root>/docs/plans/task.md`.
6. Report evidence, then claim completion.
