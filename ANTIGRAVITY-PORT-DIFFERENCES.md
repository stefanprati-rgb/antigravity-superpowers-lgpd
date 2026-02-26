# Antigravity Port Differences vs Original Superpowers

This document lists the current differences between:

- Original skill set: `skills/`
- Antigravity port: `templates/.agent/skills/` (+ Antigravity profile docs/tests)

## 1) High-Level Delta

- Skill count changed from **14** (original) to **13** (port).
- Port keeps 12 original skill names, removes 2, and adds:
  - `single-flow-task-execution` (new Antigravity-only execution skill, consolidates content from the removed `dispatching-parallel-agents` and `subagent-driven-development`)
- Removed skills:
  - `dispatching-parallel-agents` — decomposition pattern merged into `single-flow-task-execution`
  - `subagent-driven-development` — two-stage review loop merged into `single-flow-task-execution`
- Core model changed from generic subagent/parallel coding to **single-flow task execution**.
- Generic coding subagent usage is replaced with:
  - `task_boundary` for coding tasks
  - `browser_subagent` only for browser automation
- Legacy platform/tool vocabulary was translated to Antigravity equivalents:
  - `Claude/Claude Code` -> `Antigravity`
  - `Skill tool` -> `view_file`
  - `TodoWrite` -> update `<project-root>/docs/plans/task.md`
  - `superpowers:<skill>` references -> local `.agent/skills/.../SKILL.md`

## 2) Task Tracking Model Differences

- Original skills used `TodoWrite` semantics.
- Port uses project runtime file: `<project-root>/docs/plans/task.md`.
- Port includes `.agent/task.md` as a **template/instruction reference** only.
- Live tracker requirements in the port:
  - lives at project root `docs/plans/task.md`
  - table-only tracker (no prose/instructions)
  - not packaged as `templates/.agent/docs/plans/task.md`

## 3) Skill-by-Skill Differences

## Major Behavioral Rewrites

- `single-flow-task-execution` (NEW — consolidated from 3 sources)
  - Merges content from original `dispatching-parallel-agents` (task decomposition + queuing) and `subagent-driven-development` (two-stage review loop).
  - Strict single-flow execution with `task_boundary`, review gates retained.
  - Progress tracking via `<project-root>/docs/plans/task.md`.
  - Review prompt templates (`implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`) moved into this skill directory.

- `requesting-code-review`
  - Original: dispatches `superpowers:code-reviewer` subagent.
  - Port: checklist-based structured review flow (no generic coding subagent dispatch).
  - Integration text updated to single-flow wording.

- `writing-plans`
  - Original handoff: subagent-driven vs parallel-session via `superpowers:*`.
  - Port handoff: `single-flow-task-execution` vs `.agent/skills/executing-plans/SKILL.md`.
  - Plan header updated for Antigravity-required execution skill path.

- `executing-plans`
  - Original: creates/uses `TodoWrite`; integrates with `superpowers:*` skills.
  - Port: updates `<project-root>/docs/plans/task.md` and uses local `.agent/skills` references.
  - Adds explicit `task_boundary`/`browser_subagent` execution rule.

## Targeted Adaptations (Not Full Rewrites)

- `using-superpowers`
  - Skill loading switched to `view_file`.
  - Checklist tracking switched to project-root `docs/plans/task.md`.
  - Adds explicit instruction to create tracker file if missing (table-only format).

- `writing-skills`
  - Platform references and personal skill paths changed to Antigravity style.
  - Required background references changed from `superpowers:*` to local `.agent/skills` paths.
  - Checklist tracking text updated to project-root table-only tracker.

- `systematic-debugging`
  - Related skill references changed from `superpowers:*` to local `.agent/skills/...`.
  - Support creation log path references normalized away from Claude-specific location.

- `using-git-worktrees`
  - Directory preference source changed from `CLAUDE.md` to `.agent/AGENTS.md`.

- `receiving-code-review`
  - Style violation example changed from `CLAUDE.md` violation to `.agent/AGENTS.md` violation.

- `writing-skills/persuasion-principles.md`
  - `TodoWrite` examples updated to `<project-root>/docs/plans/task.md` tracking wording.

## Mostly Preserved Skills (Behavior Intact, Terminology/Path Normalization)

- `brainstorming`
- `test-driven-development`
- `verification-before-completion`
- `finishing-a-development-branch`

These keep the original core process intent, with Antigravity naming/path normalization where needed.

## 4) Renamed Supporting Files in `writing-skills`

- `anthropic-best-practices.md` -> `antigravity-best-practices.md`
- `examples/CLAUDE_MD_TESTING.md` -> `examples/AGENTS_MD_TESTING.md`

## 5) Antigravity-Only Profile Files Added

Compared to original `skills/`-only set, the port adds profile scaffolding:

- `.agent/AGENTS.md` (tool translation + execution contract)
- `.agent/INSTALL.md` (installation for target projects)
- `.agent/task.md` (template/reference)
- `.agent/tests/check-antigravity-profile.sh`
- `.agent/tests/run-tests.sh`
- `README.md`
- `CURRENT-FLOW.md`

## 6) Validation/Guardrail Differences

The Antigravity port adds automated profile checks that the original skill library does not include:

- Required skill/doc presence checks
- Frontmatter validation (`name`, `description`)
- Legacy-instruction pattern detection (e.g., old `superpowers:`/Task tool phrasing)
- AGENTS mapping contract checks
- Guard that packaged runtime tracker (`templates/.agent/docs/plans/task.md`) is absent
