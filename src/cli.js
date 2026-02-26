import { initCommand } from "./commands/init.js";

function helpText() {
  return [
    "antigravity-superpowers",
    "",
    "Usage:",
    "  antigravity-superpowers init [target-directory] [--force]",
    "",
    "Commands:",
    "  init      Initialize .agent profile in a project",
    "",
    "Options:",
    "  -f, --force   Overwrite existing .agent directory",
    "  -h, --help    Show help",
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

  io.stderr.write(`Unknown command: ${command}\n\n${helpText()}\n`);
  return 1;
}
