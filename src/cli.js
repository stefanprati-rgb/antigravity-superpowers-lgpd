import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { doctorCommand } from "./commands/doctor.js";

function helpText() {
  return [
    "antigravity-lgpd",
    "",
    "Usage:",
    "  antigravity-lgpd init [target-directory] [--force] [--dry-run]",
    "  antigravity-lgpd validate [target-directory]",
    "  antigravity-lgpd doctor [target-directory]",
    "",
    "Commands:",
    "  init        Initialize .agent profile in a project",
    "  validate    Validate an installed .agent profile",
    "  doctor      Diagnose common configuration issues",
    "",
    "Options:",
    "  -f, --force     Overwrite existing .agent directory",
    "  -n, --dry-run   Show what would happen without making changes",
    "  -h, --help      Show help",
  ].join("\n");
}

export async function runCli(args, io = process) {
  const [command, ...rest] = args;

  if (!command || command === "-h" || command === "--help" || command === "help") {
    io.stdout.write(`${helpText()}\n`);
    return 0;
  }

  if (command === "init") {
    return initCommand(rest, {
      cwd: io.cwd?.() ?? process.cwd(),
      stdout: io.stdout,
      stderr: io.stderr,
    });
  }

  if (command === "validate") {
    return validateCommand(rest, {
      cwd: io.cwd?.() ?? process.cwd(),
      stdout: io.stdout,
      stderr: io.stderr,
    });
  }

  if (command === "doctor") {
    return doctorCommand(rest, {
      cwd: io.cwd?.() ?? process.cwd(),
      stdout: io.stdout,
      stderr: io.stderr,
    });
  }

  io.stderr.write(`Unknown command: ${command}\n\n${helpText()}\n`);
  return 1;
}
