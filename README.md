# antigravity-superpowers

CLI for initializing the Antigravity Superpowers profile in any project.

## What `init` does

- Copies bundled profile files into `<project-root>/.agent`
- Fails safely if `.agent` already exists
- Supports `--force` to replace existing `.agent`

The CLI does **not** create `docs/plans/task.md`. That live tracker is created at runtime by skill flow.

## Usage

```bash
antigravity-superpowers init
```

```bash
antigravity-superpowers init /path/to/project
```

```bash
antigravity-superpowers init --force
```

## Local Development

From the package directory:

```bash
npm test
npm run smoke:pack
```

## Publish Workflow

The release flow is manual by design.

```bash
npm version patch
npm publish
```

`prepublishOnly` automatically runs:

1. `npm test`
2. `npm run smoke:pack`
