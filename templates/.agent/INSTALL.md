# Install Superpowers Agent Profiles

This package provides agent-optimized configuration profiles for AI coding assistants. Each agent gets only the instructions relevant to it — no cross-contamination, no wasted tokens.

## Prerequisites

- Node.js 18+ installed
- Shell access
- This repository available locally

## Install

### Quick Install (All Agents)

From your project root:

```bash
npx antigravity-superpowers init
```

Or manually:

```bash
node .agent/tools/install.mjs
```

### Agent-Specific Install

Install profiles for only the agents you use:

```bash
# Codex only (ChatGPT CLI/Sandbox)
node .agent/tools/install.mjs --codex

# Gemini only (Antigravity)
node .agent/tools/install.mjs --gemini

# Claude only (Claude Code)
node .agent/tools/install.mjs --claude

# Combine as needed
node .agent/tools/install.mjs --codex --gemini
```

### Options

| Flag | Description |
|---|---|
| `--codex` | Generate Codex-optimized `AGENTS.md` + `.codex/config.toml` |
| `--gemini` | Generate Gemini-optimized `GEMINI.md` + `.gemini/settings.json` + `.aiexclude` |
| `--claude` | Generate Claude-optimized `CLAUDE.md` + `.claude/settings.json` |
| `--force` | Overwrite existing generated files |
| `--clean` | Remove all generated profile files |
| `--help` | Show help |

If no agent flags are given, **all profiles are installed**.

## What Gets Installed

### Shared (always installed)

- `.agent/skills/*` — Modular skill definitions
- `.agent/workflows/*` — Execution workflows
- `.agent/agents/*` — Agent definitions (code-reviewer)
- `.agent/tools/*` — Helper scripts (LGPD, renderer, installer)
- `.agent/profiles/*` — Source templates for each agent
- `.agent/tests/*` — Validation tests

### Per Agent

| Agent | Generated Files | Purpose |
|---|---|---|
| **Codex** | `AGENTS.md`, `.codex/config.toml` | Codex reads `AGENTS.md` by default |
| **Gemini** | `GEMINI.md`, `.gemini/settings.json`, `.aiexclude` | Gemini reads `GEMINI.md` (takes precedence over `AGENTS.md`) |
| **Claude** | `CLAUDE.md`, `.claude/settings.json` | Claude Code reads `CLAUDE.md` by default |

### How Coexistence Works

Each agent reads a **different** file by default:
- **Codex** → `AGENTS.md` (AAIF standard)
- **Gemini** → `GEMINI.md` (native, takes precedence when present)
- **Claude** → `CLAUDE.md` (Claude Code standard)

This means all three can coexist without conflict. Each agent sees only its optimized profile.

### Runtime tracking (created by skill flow)

- `docs/plans/task.json` — Live task state
- `docs/plans/task.md` — Human-readable task table

## Verify Installation

```bash
# Run full profile validation
bash .agent/tests/run-tests.sh

# Run profile isolation checks only
node .agent/tests/check-profile-isolation.mjs
```

Expected result: all checks pass with zero failures.

## Update

Re-run the installer with `--force` to regenerate profiles from latest templates:

```bash
node .agent/tools/install.mjs --force
```

Then rerun validation:

```bash
bash .agent/tests/run-tests.sh
```

## Clean

Remove all generated profile files:

```bash
node .agent/tools/install.mjs --clean
```

## Template Customization

Profile templates live in `.agent/profiles/`:

```
.agent/profiles/
├── shared/
│   └── core-rules.md        # Rules injected into ALL profiles
├── codex/
│   ├── agent-profile.md      # Codex-specific template
│   └── config.toml           # .codex/config.toml template
├── gemini/
│   ├── agent-profile.md      # Gemini-specific template
│   ├── settings.json         # .gemini/settings.json template
│   └── aiexclude             # .aiexclude template
└── claude/
    ├── agent-profile.md      # Claude-specific template
    └── settings.json         # .claude/settings.json template
```

Edit `shared/core-rules.md` for rules that apply to all agents. Edit agent-specific templates for agent-targeted instructions. Then re-run `install.mjs --force`.

## Usage Notes

- This profile uses strict single-flow task execution.
- Browser automation uses `browser_subagent` (Gemini only).
- Skill references are local to `.agent/skills/`.
- The `{core-rules}` placeholder in templates is replaced at install time.
