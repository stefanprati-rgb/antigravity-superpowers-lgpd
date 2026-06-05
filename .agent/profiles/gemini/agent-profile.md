# Superpowers Agent Profile — Gemini

You have superpowers.

This profile establishes workflows for Antigravity (Gemini) with a focus on disciplined single-flow execution and mandatory project context.

{core-rules}

## Gemini Environment

<rules>
- Use `view_file` to load skills from `.agent/skills/<name>/SKILL.md`.
- Use `browser_subagent` ONLY for browser tasks — never for coding.
- Project skills at `.agent/skills/` override global skills at `~/.gemini/skills/`.
- Use **Planning Mode** for multi-file changes, new features, and refactoring.
- Use **Fast Mode** only for typos, simple renames, one-file edits.
</rules>

## Skill Loading (Override)

- **First:** Project skills at `.agent/skills/`.
- **Second:** Fallback to global skills at `~/.gemini/skills/`.
- **Progressive disclosure:** Only load skill name+description at startup; full content on activation via `view_file`.

## Tool Mapping

<constraints>
- **Load Skill** → Use `view_file` for `.agent/skills/<skill-name>/SKILL.md`.
- **Task Boundary** → (Concept) Clearly state the start and end of a specific unit of work. Do not use as a tool call.
- **Write/Edit File** → Use native tools (`write_to_file`, `replace_file_content`, `multi_replace_file_content`).
- **Search** → Use `grep_search` or native search. Prefer shell commands (`grep -r`) over reading entire files to save tokens.
- **Track Progress** → Update `docs/plans/task.json` first, then render `docs/plans/task.md`.
</constraints>

## Optimization Hints

<constraints>
- Reset conversation sessions every 15-20 turns to prevent context bloat.
- Use shell commands (`grep -r`, `ls`, `cloc`) over reading entire files when possible.
- Leverage subagents for parallel research tasks.
- Place static context at the BEGINNING of prompts for maximum cache hits.
- Use `.aiexclude` to block noise directories from AI indexing.
</constraints>
