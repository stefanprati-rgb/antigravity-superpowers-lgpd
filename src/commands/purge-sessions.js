import { readdir, readFile, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

export async function purgeSessionsCommand(args, { cwd, stdout, stderr }) {
    const targetDir = resolve(cwd, args[0] || ".");
    const memoryFile = join(targetDir, ".agent", "memory.md");
    const sessionsDir = join(targetDir, ".agent", "sessions");

    try {
        let memoryContent = "";
        try {
            memoryContent = await readFile(memoryFile, "utf-8");
        } catch {
            stdout.write(`No memory.md found at ${memoryFile}. Assuming no sessions need purging.\n`);
            return 0;
        }

        const retentionMatch = memoryContent.match(/log_retention_days:\s*(\d+)/);
        if (!retentionMatch) {
            stdout.write("No log_retention_days found in memory.md. Defaulting to 30 days.\n");
        }
        const retentionDays = retentionMatch ? parseInt(retentionMatch[1], 10) : 30;

        let files = [];
        try {
            files = await readdir(sessionsDir);
        } catch {
            stdout.write(`No sessions directory found at ${sessionsDir}.\n`);
            return 0;
        }

        const now = Date.now();
        const threshold = now - (retentionDays * 24 * 60 * 60 * 1000);
        let purgedCount = 0;

        for (const file of files) {
            if (!file.endsWith(".md")) continue;

            const filePath = join(sessionsDir, file);
            const stats = await stat(filePath);

            if (stats.mtimeMs < threshold) {
                await rm(filePath);
                purgedCount++;
            }
        }

        stdout.write(`Purged ${purgedCount} session files older than ${retentionDays} days.\n`);
        return 0;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        stderr.write(`Purge sessions failed: ${message}\n`);
        return 1;
    }
}
