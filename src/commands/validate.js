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

const REQUIRED_FILES = [
    "AGENTS.md",
    "INSTALL.md",
    "task.md",
    "workflows/brainstorm.md",
    "workflows/write-plan.md",
    "workflows/execute-plan.md",
    "tests/run-tests.sh",
    "tests/check-antigravity-profile.sh",
];

const REQUIRED_SKILLS = [
    "brainstorming",
    "executing-plans",
    "finishing-a-development-branch",
    "receiving-code-review",
    "requesting-code-review",
    "systematic-debugging",
    "test-driven-development",
    "using-git-worktrees",
    "using-superpowers",
    "verification-before-completion",
    "writing-plans",
    "writing-skills",
    "single-flow-task-execution",
    "project-onboarding",
    "handling-personal-data",
    "clean-architecture-enforcer",
];

export async function validateCommand(args, { cwd, stdout, stderr }) {
    const targetDir = resolve(args[0] || cwd);
    const agentDir = join(targetDir, ".agent");

    if (!(await exists(agentDir))) {
        stderr.write(`No .agent directory found at ${targetDir}\n`);
        stderr.write("Run 'antigravity-lgpd init' first.\n");
        return 1;
    }

    let pass = 0;
    let fail = 0;

    const check = async (label, path) => {
        if (await exists(path)) {
            stdout.write(`  [PASS] ${label}\n`);
            pass++;
        } else {
            stdout.write(`  [FAIL] ${label}\n`);
            fail++;
        }
    };

    stdout.write("Checking required files...\n");
    for (const file of REQUIRED_FILES) {
        await check(file, join(agentDir, file));
    }

    stdout.write("\nChecking required skills...\n");
    for (const skill of REQUIRED_SKILLS) {
        await check(
            `skills/${skill}/SKILL.md`,
            join(agentDir, "skills", skill, "SKILL.md"),
        );
    }

    stdout.write("\nChecking skill frontmatter...\n");
    for (const skill of REQUIRED_SKILLS) {
        const skillPath = join(agentDir, "skills", skill, "SKILL.md");
        if (await exists(skillPath)) {
            const content = await readFile(skillPath, "utf8");
            const hasFrontmatter = content.startsWith("---");
            const hasName = /^name:\s*\S/m.test(content);
            const hasDesc = /^description:\s*\S/m.test(content);
            if (hasFrontmatter && hasName && hasDesc) {
                stdout.write(`  [PASS] ${skill} frontmatter valid\n`);
                pass++;
            } else {
                const missing = [];
                if (!hasFrontmatter) missing.push("delimiters");
                if (!hasName) missing.push("name");
                if (!hasDesc) missing.push("description");
                stdout.write(`  [FAIL] ${skill} frontmatter invalid (missing: ${missing.join(", ")})\n`);
                fail++;
            }
        }
    }

    stdout.write(`\n========================================\n`);
    stdout.write(`  Passed: ${pass}  Failed: ${fail}\n`);
    stdout.write(`========================================\n`);
    stdout.write(`STATUS: ${fail > 0 ? "FAILED" : "PASSED"}\n`);

    return fail > 0 ? 1 : 0;
}
