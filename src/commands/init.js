import { access, chmod, cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

function getTemplateDir() {
  return fileURLToPath(new URL("../../templates/.agent", import.meta.url));
}

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function parseInitArgs(args) {
  const parsed = {
    target: ".",
    force: false,
    dryRun: false,
    withMemory: false,
  };
  let targetSet = false;

  for (const arg of args) {
    if (arg === "--force" || arg === "-f") {
      parsed.force = true;
      continue;
    }

    if (arg === "--dry-run" || arg === "-n") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--with-memory") {
      parsed.withMemory = true;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option for init: ${arg}`);
    }

    if (targetSet) {
      throw new Error("Too many positional arguments. Only one target directory is supported.");
    }

    parsed.target = arg;
    targetSet = true;
  }

  return parsed;
}

async function validateTargetDir(targetDir) {
  let targetStat;
  try {
    targetStat = await stat(targetDir);
  } catch {
    throw new Error(`Target directory does not exist: ${targetDir}`);
  }

  if (!targetStat.isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetDir}`);
  }
}

async function installLgpdHook(targetDir, stdout) {
  const gitDir = join(targetDir, ".git");
  const hookPath = join(gitDir, "hooks", "pre-commit");

  if (!(await exists(gitDir))) {
    stdout.write("No .git directory found; LGPD pre-commit hook scanner is available at .agent/tools/lgpd-pre-commit.mjs.\n");
    return;
  }

  if (await exists(hookPath)) {
    stdout.write("Existing .git/hooks/pre-commit found; leaving it untouched. Add `node .agent/tools/lgpd-pre-commit.mjs` to chain the LGPD scanner.\n");
    return;
  }

  await mkdir(join(gitDir, "hooks"), { recursive: true });
  await writeFile(
    hookPath,
    [
      "#!/usr/bin/env sh",
      "node .agent/tools/lgpd-pre-commit.mjs",
      "",
    ].join("\n"),
    "utf8",
  );
  await chmod(hookPath, 0o755);
  stdout.write("Installed LGPD pre-commit hook at .git/hooks/pre-commit\n");
}

export async function initCommand(args, { cwd, stdout, stderr }) {
  let parsed;
  try {
    parsed = parseInitArgs(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`${message}\n`);
    return 1;
  }

  const targetDir = resolve(cwd, parsed.target);
  const agentDir = join(targetDir, ".agent");
  const templateDir = getTemplateDir();

  try {
    await validateTargetDir(targetDir);

    const templateExists = await exists(templateDir);
    if (!templateExists) {
      throw new Error(
        "Bundled template is missing. Run `npm run sync:templates` before using init from source.",
      );
    }

    const agentExists = await exists(agentDir);

    if (parsed.dryRun) {
      stdout.write("Dry run — no files will be modified.\n");
      stdout.write(`Would initialize .agent profile at ${agentDir}\n`);
      stdout.write("Would install LGPD pre-commit hook when .git/hooks/pre-commit is available to create safely.\n");
      if (agentExists && !parsed.force) {
        stdout.write("Would fail: .agent already exists (use --force).\n");
      } else if (agentExists && parsed.force) {
        stdout.write("Would backup and replace existing .agent directory.\n");
      }
      return 0;
    }

    if (agentExists && !parsed.force) {
      stderr.write(
        `.agent already exists at ${agentDir}. Re-run with --force to replace it.\n`,
      );
      return 1;
    }

    if (agentExists && parsed.force) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const backupDir = join(targetDir, `.agent-backup-${timestamp}`);
      await cp(agentDir, backupDir, { recursive: true });
      stdout.write(`Backed up existing .agent to ${backupDir}\n`);
      await rm(agentDir, { recursive: true, force: true });
    }

    await cp(templateDir, agentDir, { recursive: true });
    await installLgpdHook(targetDir, stdout);

    if (!parsed.withMemory) {
      await rm(join(agentDir, "memory.md"), { force: true });
      await rm(join(agentDir, "USER.md"), { force: true });
      await rm(join(agentDir, "sessions"), { recursive: true, force: true });
    }

    stdout.write(`Initialized Superpowers agent profile at ${agentDir}\n`);
    stdout.write("Next step: bash .agent/tests/run-tests.sh\n");
    stdout.write(
      "Note: docs/plans/task.md is created at runtime by skills when task tracking starts.\n",
    );
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`Init failed: ${message}\n`);
    return 1;
  }
}
