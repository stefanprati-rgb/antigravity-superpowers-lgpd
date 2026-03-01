import { access, cp, rm, stat } from "node:fs/promises";
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
        "Bundled template is missing. Run `npm run sync:template` before using init from source.",
      );
    }

    const agentExists = await exists(agentDir);

    if (parsed.dryRun) {
      stdout.write("Dry run — no files will be modified.\n");
      stdout.write(`Would initialize .agent profile at ${agentDir}\n`);
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

    stdout.write(`Initialized Antigravity Superpowers profile at ${agentDir}\n`);
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
