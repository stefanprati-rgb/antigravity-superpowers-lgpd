import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const MAX_SUMMARY_CHARS = 700;

function stripMarkdownNoise(content) {
    return content
        .replace(/```[\s\S]*?```/g, "[code omitted]")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\r\n/g, "\n")
        .trim();
}

function summarizeSession(file, content) {
    const normalized = stripMarkdownNoise(content);
    const headings = [...normalized.matchAll(/^#{1,4}\s+(.+)$/gm)]
        .map((match) => match[1].trim())
        .slice(0, 5);
    const decisions = normalized
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /decision|decid|arquitet|architecture|trade-?off|root cause|aprend|learned/i.test(line))
        .slice(0, 5);
    const source = [...headings, ...decisions].join("; ") || normalized.replace(/\s+/g, " ");
    const compact = source.length > MAX_SUMMARY_CHARS
        ? `${source.slice(0, MAX_SUMMARY_CHARS - 3)}...`
        : source;
    return `- ${file}: ${compact || "No durable context found."}`;
}

function appendArchivedSummaries(memoryContent, summaries, timestamp) {
    if (summaries.length === 0) return memoryContent;

    const section = [
        "",
        "## Archived Session Summaries",
        `### ${timestamp}`,
        ...summaries,
        "",
    ].join("\n");

    return `${memoryContent.trimEnd()}\n${section}`;
}

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
        const summaries = [];

        for (const file of files) {
            if (!file.endsWith(".md")) continue;

            const filePath = join(sessionsDir, file);
            const stats = await stat(filePath);

            if (stats.mtimeMs < threshold) {
                const sessionContent = await readFile(filePath, "utf-8");
                summaries.push(summarizeSession(file, sessionContent));
                await rm(filePath);
                purgedCount++;
            }
        }

        if (summaries.length > 0) {
            const timestamp = new Date(now).toISOString();
            const updatedMemory = appendArchivedSummaries(memoryContent, summaries, timestamp);
            await writeFile(memoryFile, updatedMemory, "utf-8");
        }

        stdout.write(`Summarized ${summaries.length} old session files into memory.md.\n`);
        stdout.write(`Purged ${purgedCount} session files older than ${retentionDays} days.\n`);
        return 0;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        stderr.write(`Purge sessions failed: ${message}\n`);
        return 1;
    }
}
