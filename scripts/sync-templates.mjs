import { cp, rm, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootAgent = resolve(__dirname, "../../.agent");
const templatesAgent = resolve(__dirname, "../templates/.agent");

async function exists(path) {
    try {
        await access(path, fsConstants.F_OK);
        return true;
    } catch {
        return false;
    }
}

// Items to sync (excludes project.md which is repo-specific)
const syncItems = [
    "AGENTS.md",
    "INSTALL.md",
    "task.md",
    "skills",
    "workflows",
    "agents",
    "tests",
    "boilerplate",
];

process.stdout.write("Syncing .agent/ → templates/.agent/\n");

let synced = 0;
let skipped = 0;

for (const item of syncItems) {
    const src = resolve(rootAgent, item);
    const dest = resolve(templatesAgent, item);

    if (!(await exists(src))) {
        process.stdout.write(`  ⚠ Skipped (not found): ${item}\n`);
        skipped++;
        continue;
    }

    await rm(dest, { recursive: true, force: true });
    await cp(src, dest, { recursive: true });
    process.stdout.write(`  ✓ ${item}\n`);
    synced++;
}

process.stdout.write(`\nSync complete: ${synced} synced, ${skipped} skipped.\n`);
