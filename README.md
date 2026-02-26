# antigravity-superpowers

**Bring the power of [Superpowers](https://github.com/superpowers) to [Antigravity](https://antigravity.dev).**

Superpowers is an incredible skill-based workflow system that gives AI coding assistants structured, reliable behavior — brainstorming, planning, test-driven development, code review, debugging, and more. It was originally designed for Claude Code, but the workflows themselves are platform-agnostic gold.

**This project ports that entire system to Antigravity**, preserving the original flow as faithfully as possible. The goal is not to reinvent Superpowers — it's to make them available on Antigravity with the minimal set of changes needed for native compatibility. If you've used Superpowers before, everything should feel familiar. If you haven't, this is a great way to start.

One command. Full profile. Ready to go.

```bash
npx antigravity-superpowers init
```

## Why This Exists

Superpowers skills bring real structure to AI-assisted development: brainstorming before implementation, planning before coding, verification before completion claims. That discipline shouldn't be locked to one platform.

This port keeps **12 out of 14 original skills intact** and consolidates the remaining 2 into a single new skill that fits Antigravity's execution model. Every skill preserves its original intent, logic, and flow — only the platform-specific references, tool names, and execution primitives have been adapted.

## What's Included

13 skills covering the full development lifecycle:

- **`brainstorming`** — structured exploration before committing to an approach
- **`writing-plans`** — detailed, step-by-step implementation plans
- **`executing-plans`** — disciplined plan execution with progress tracking
- **`single-flow-task-execution`** — ordered task decomposition with review gates _(new, Antigravity-native)_
- **`test-driven-development`** — write tests first, implement second
- **`systematic-debugging`** — root cause tracing with supporting techniques
- **`requesting-code-review`** — structured review flow with checklists
- **`receiving-code-review`** — handling feedback systematically
- **`verification-before-completion`** — prove it works before claiming it's done
- **`finishing-a-development-branch`** — clean branch wrap-up with workflow options
- **`using-git-worktrees`** — parallel branch management
- **`using-superpowers`** — skill routing and session bootstrap
- **`writing-skills`** — create new skills that follow the system's conventions

Plus supporting infrastructure: workflows, agents, validation tests, and an AGENTS.md contract that ties it all together.

## Install

```bash
# Scaffold the .agent profile into your project
npx antigravity-superpowers init
```

Or install globally:

```bash
npm install -g antigravity-superpowers
antigravity-superpowers init
```

## Usage

```bash
# Initialize in current directory
antigravity-superpowers init

# Initialize in a specific project
antigravity-superpowers init /path/to/project

# Replace an existing .agent profile
antigravity-superpowers init --force
```

After init, verify everything is wired up:

```bash
bash .agent/tests/run-tests.sh
```

## How It Works

The CLI copies a complete `.agent` profile into your project root. Once initialized, Antigravity picks up the profile automatically:

1. **Session starts** — loads `.agent/AGENTS.md` rules and `using-superpowers` skill
2. **Each request gets routed** to the most relevant skill
3. **Design work** flows through brainstorming → planning → execution
4. **Every task** is tracked in `docs/plans/task.md` (created at runtime)
5. **Nothing is marked done** without running verification commands first

```
Session Start → Load AGENTS.md → Load using-superpowers
                                        ↓
                              Route to relevant skill
                                        ↓
                          ┌─── Design change? ───┐
                          │ yes                   │ no
                     Brainstorm            Single-flow execution
                          ↓                       ↓
                    Writing plans          Verify before completion
                          ↓                       ↓
                  Single-flow execution   Finish branch
                          ↓
                  Verify before completion
                          ↓
                     Finish branch
```

## What Changed from Original Superpowers

This port aims to stay as close to the original Superpowers as possible. The changes are the minimum required to run natively on Antigravity. Here's what's different:

### Execution Model

The one notable structural change. The original Superpowers dispatches multiple coding subagents in parallel — but Antigravity doesn't support parallel subagent execution. So the two skills that relied on that capability (`dispatching-parallel-agents` and `subagent-driven-development`) couldn't be ported as-is. Instead, they were consolidated into a single new skill — **`single-flow-task-execution`** — which preserves the same decomposition logic, task queuing, and review gates, just executed sequentially rather than in parallel. The workflow is the same; the concurrency model is what changed.

| Original Skill                | What Happened                                                   |
| ----------------------------- | --------------------------------------------------------------- |
| `dispatching-parallel-agents` | Merged into `single-flow-task-execution`                        |
| `subagent-driven-development` | Merged into `single-flow-task-execution`                        |
| `single-flow-task-execution`  | **New** — consolidates decomposition, queuing, and review loops |

### Task Tracking

- **Original:** `TodoWrite` tool
- **Port:** Live table at `<project-root>/docs/plans/task.md` (created at runtime, not bundled)

### Tool & Platform Vocabulary

Platform-specific references were translated — the underlying behavior is unchanged:

| Original                 | Antigravity Port                 |
| ------------------------ | -------------------------------- |
| `Claude` / `Claude Code` | `Antigravity`                    |
| `Skill` tool             | `view_file`                      |
| `TodoWrite`              | Update `docs/plans/task.md`      |
| `superpowers:<skill>`    | `.agent/skills/<skill>/SKILL.md` |
| `CLAUDE.md`              | `.agent/AGENTS.md`               |

### Skill Adaptations

Most skills required only terminology and path updates. A few needed slightly more work:

- **`requesting-code-review`** — uses a checklist-based review flow instead of subagent dispatch
- **`writing-plans`** / **`executing-plans`** — handoff paths and tracker references updated for Antigravity conventions

The rest — `brainstorming`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch`, and others — preserve their original behavior with only naming and path normalization.

### Antigravity-Native Additions

Infrastructure added to make the profile work as a first-class Antigravity citizen:

- `.agent/AGENTS.md` — tool translation contract and execution rules
- `.agent/workflows/` — workflow entrypoints (`brainstorm.md`, `execute-plan.md`, `write-plan.md`)
- `.agent/agents/code-reviewer.md` — reviewer agent profile
- `.agent/tests/` — automated profile validation (skill presence, frontmatter, legacy pattern detection)

### Full Diff

See [ANTIGRAVITY-PORT-DIFFERENCES.md](ANTIGRAVITY-PORT-DIFFERENCES.md) for the exhaustive skill-by-skill comparison and [CURRENT-FLOW.md](CURRENT-FLOW.md) for the complete workflow diagram.

## Contributing

Contributions are welcome. If you find a skill that could be ported more faithfully, a translation that's off, or an Antigravity convention that's not followed — open an issue or PR.

When making changes, run the validation suite to make sure everything still checks out:

```bash
npm test
bash .agent/tests/run-tests.sh
```

## Local Development

```bash
npm test
npm run smoke:pack
```

## Publishing

```bash
npm version patch
npm publish
```

`prepublishOnly` runs `npm test` and `npm run smoke:pack` automatically.

## License

MIT
