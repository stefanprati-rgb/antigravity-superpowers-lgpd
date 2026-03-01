import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join, resolve } from "node:path";

async function exists(path) {
    try {
        await access(path, fsConstants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function nodeVersionOk() {
    const [major] = process.versions.node.split(".").map(Number);
    return major >= 20;
}

export async function doctorCommand(args, { cwd, stdout }) {
    const targetDir = resolve(args[0] || cwd);
    const agentDir = join(targetDir, ".agent");

    let warnings = 0;
    let ok = 0;

    const good = (msg) => {
        stdout.write(`  ✓ ${msg}\n`);
        ok++;
    };

    const warn = (msg, fix) => {
        stdout.write(`  ✗ ${msg}\n`);
        if (fix) stdout.write(`    → Fix: ${fix}\n`);
        warnings++;
    };

    stdout.write("Antigravity LGPD Doctor\n");
    stdout.write("========================================\n\n");

    // 1. Node version check
    stdout.write("Environment:\n");
    if (nodeVersionOk()) {
        good(`Node.js ${process.versions.node} (>= 20 required)`);
    } else {
        warn(
            `Node.js ${process.versions.node} is too old (>= 20 required)`,
            "Upgrade Node.js to version 20 or later",
        );
    }

    // 2. .agent directory check
    stdout.write("\nProfile:\n");
    if (await exists(agentDir)) {
        good(".agent/ directory exists");
    } else {
        warn(
            ".agent/ directory not found",
            "Run 'antigravity-lgpd init' to create it",
        );
        // Can't check further without .agent
        stdout.write(`\n${ok} ok, ${warnings} warning(s)\n`);
        return warnings > 0 ? 1 : 0;
    }

    // 3. Context First: project.md
    if (await exists(join(agentDir, "project.md"))) {
        good("project.md exists (Context First)");
    } else {
        warn(
            "project.md missing — AI will generate code without project context",
            "Run the project-onboarding skill or create .agent/project.md manually",
        );
    }

    // 4. AGENTS.md
    if (await exists(join(agentDir, "AGENTS.md"))) {
        good("AGENTS.md exists");
    } else {
        warn("AGENTS.md missing", "Re-run 'antigravity-lgpd init --force'");
    }

    // 5. Runtime tracker check
    stdout.write("\nRuntime:\n");
    const trackerPath = join(targetDir, "docs", "plans", "task.md");
    if (await exists(trackerPath)) {
        good("docs/plans/task.md exists (runtime tracker)");
    } else {
        warn(
            "docs/plans/task.md not found",
            "This is normal — it's created at runtime when task tracking starts",
        );
    }

    // 6. Key skills check
    stdout.write("\nKey Skills:\n");
    const keySkills = [
        { name: "handling-personal-data", label: "LGPD Guardrail" },
        { name: "project-onboarding", label: "Context First" },
        { name: "single-flow-task-execution", label: "Single-Flow Execution" },
        { name: "clean-architecture-enforcer", label: "Clean Architecture" },
    ];

    for (const { name, label } of keySkills) {
        const skillPath = join(agentDir, "skills", name, "SKILL.md");
        if (await exists(skillPath)) {
            const content = await readFile(skillPath, "utf8");
            const valid =
                content.startsWith("---") &&
                /^name:\s*\S/m.test(content) &&
                /^description:\s*\S/m.test(content);
            if (valid) {
                good(`${name} (${label})`);
            } else {
                warn(
                    `${name} has invalid frontmatter`,
                    "Ensure SKILL.md has name and description in YAML frontmatter",
                );
            }
        } else {
            warn(`${name} (${label}) missing`, "Re-run 'antigravity-lgpd init --force'");
        }
    }

    // 7. Boilerplate
    stdout.write("\nBoilerplate:\n");
    if (await exists(join(agentDir, "boilerplate", "architecture.md"))) {
        good("architecture.md template available");
    } else {
        warn("architecture.md template missing", "Re-run sync:templates or init --force");
    }
    if (await exists(join(agentDir, "boilerplate", "conventions.md"))) {
        good("conventions.md template available");
    } else {
        warn("conventions.md template missing", "Re-run sync:templates or init --force");
    }

    stdout.write("\n========================================\n");
    stdout.write(`${ok} ok, ${warnings} warning(s)\n`);
    stdout.write(`STATUS: ${warnings > 0 ? "NEEDS ATTENTION" : "HEALTHY"}\n`);

    return warnings > 0 ? 1 : 0;
}
