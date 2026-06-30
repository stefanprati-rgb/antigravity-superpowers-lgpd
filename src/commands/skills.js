import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join, resolve } from "node:path";

const ECC_REPO = {
  owner: "affaan-m",
  repo: "ECC",
  ref: "main",
};

const DEFAULT_IMPORT_ADAPTERS = ["codex", "gemini"];

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function skillsHelpText() {
  return [
    "antigravity-lgpd skills",
    "",
    "Usage:",
    "  antigravity-lgpd skills search <query> [--limit N] [--json]",
    "  antigravity-lgpd skills show ecc/<skill-name> [--json]",
    "  antigravity-lgpd skills import ecc/<skill-name> [target-directory] [--dry-run] [--force] [--raw]",
    "",
    "Notes:",
    "  Remote skills are never executed directly. Import copies them into .agent/skills for review.",
  ].join("\n");
}

function parseCommonOptions(args, parsed) {
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (arg === "--json") {
      parsed.json = true;
      continue;
    }

    if (arg === "--limit") {
      const rawLimit = args[index + 1];
      const limit = Number.parseInt(rawLimit, 10);
      if (!Number.isInteger(limit) || limit < 1) {
        throw new Error("--limit requires a positive integer");
      }
      parsed.limit = limit;
      index++;
      continue;
    }

    if (arg === "--dry-run" || arg === "-n") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--force" || arg === "-f") {
      parsed.force = true;
      continue;
    }

    if (arg === "--raw") {
      parsed.raw = true;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option for skills ${parsed.action}: ${arg}`);
    }

    parsed.positionals.push(arg);
  }

  return parsed;
}

function parseSkillsArgs(args) {
  const [action, ...rest] = args;

  if (!action || action === "-h" || action === "--help" || action === "help") {
    return { action: "help" };
  }

  if (!["search", "show", "import"].includes(action)) {
    throw new Error(`Unknown skills action: ${action}`);
  }

  const parsed = parseCommonOptions(rest, {
    action,
    dryRun: false,
    force: false,
    json: false,
    limit: 10,
    positionals: [],
    raw: false,
  });

  if (action === "search") {
    if (parsed.positionals.length === 0) {
      throw new Error("skills search requires a query");
    }
    return {
      ...parsed,
      action,
      query: parsed.positionals.join(" "),
    };
  }

  if (action === "show") {
    if (parsed.positionals.length !== 1) {
      throw new Error("skills show requires exactly one skill id, e.g. ecc/search-first");
    }
    return {
      ...parsed,
      action,
      skillRef: parsed.positionals[0],
    };
  }

  if (parsed.positionals.length < 1 || parsed.positionals.length > 2) {
    throw new Error("skills import requires a skill id and optional target directory");
  }

  return {
    ...parsed,
    action,
    skillRef: parsed.positionals[0],
    target: parsed.positionals[1] || ".",
  };
}

function parseSkillRef(skillRef) {
  const [source, name, ...extra] = skillRef.split("/");
  if (source !== "ecc" || !name || extra.length > 0) {
    throw new Error(`Unsupported skill ref: ${skillRef}. Use ecc/<skill-name>.`);
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error(`Invalid skill name: ${name}`);
  }

  return { source, name };
}

function githubApiUrl(path) {
  return `https://api.github.com/repos/${ECC_REPO.owner}/${ECC_REPO.repo}/${path}`;
}

function eccRawUrl(skillName) {
  return `https://raw.githubusercontent.com/${ECC_REPO.owner}/${ECC_REPO.repo}/${ECC_REPO.ref}/skills/${skillName}/SKILL.md`;
}

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      accept: "text/plain, application/vnd.github+json",
      "user-agent": "antigravity-superpowers-lgpd",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.text();
}

async function fetchJson(url, fetchImpl) {
  const text = await fetchText(url, fetchImpl);
  return JSON.parse(text);
}

function extractDescription(skillContent) {
  const frontmatterMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(skillContent);
  if (!frontmatterMatch) return "";

  const frontmatter = frontmatterMatch[1];
  const singleLine = /^description:\s*["']?(.+?)["']?\s*$/m.exec(frontmatter);
  if (singleLine) return singleLine[1].trim();

  const blockMatch = /^description:\s*>-\s*\r?\n((?:\s{2,}.+\r?\n?)+)/m.exec(frontmatter);
  if (!blockMatch) return "";

  return blockMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

function skillMatchesQuery(skillName, query) {
  const normalizedName = skillName.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  return terms.every((term) => normalizedName.includes(term));
}

async function listEccSkills({ fetchImpl }) {
  const url = `${githubApiUrl("contents/skills")}?ref=${ECC_REPO.ref}`;
  const entries = await fetchJson(url, fetchImpl);
  if (!Array.isArray(entries)) {
    throw new Error("Unexpected ECC skills response");
  }

  return entries
    .filter((entry) => entry.type === "dir" && typeof entry.name === "string")
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function readEccSkill(skillName, { fetchImpl }) {
  return fetchText(eccRawUrl(skillName), fetchImpl);
}

async function readMaybeLocalSkillDescription(agentDir, skillName) {
  const skillPath = join(agentDir, "skills", skillName, "SKILL.md");
  if (!(await exists(skillPath))) return null;
  const content = await readFile(skillPath, "utf8");
  return extractDescription(content);
}

function buildAdaptedSkillContent(content, skillName, { raw }) {
  if (raw) return content;

  const note = [
    "",
    "> Imported from ECC for this Superpowers profile.",
    "> Review before relying on it. Map Claude-specific tool names through `.agent/AGENTS.md` for Codex/Gemini.",
    "",
  ].join("\n");

  if (content.startsWith("---")) {
    const closing = content.indexOf("\n---", 3);
    if (closing !== -1) {
      return `${content.slice(0, closing + 4)}${note}${content.slice(closing + 4).replace(/^\r?\n/, "\n")}`;
    }
  }

  return `# ${skillName}\n${note}${content}`;
}

function buildOriginFile({ skillName, raw }) {
  const adaptedFor = raw ? "none; raw import requested" : DEFAULT_IMPORT_ADAPTERS.join(", ");
  return [
    `# Imported Skill: ${skillName}`,
    "",
    "- Source: ECC",
    `- Source URL: ${eccRawUrl(skillName)}`,
    `- Source ref: ${ECC_REPO.ref}`,
    `- Adapted for: ${adaptedFor}`,
    "- Reviewed: false",
    "",
    "Remote skills are prompt instructions. Review this skill for Claude-specific assumptions, tool names, network expectations, and LGPD fit before relying on it.",
    "",
  ].join("\n");
}

function formatSearchResults(results) {
  if (results.length === 0) {
    return "No matching ECC skills found.\n";
  }

  const lines = ["ECC skills:"];
  for (const result of results) {
    const installed = result.installed ? " [installed]" : "";
    lines.push(`- ecc/${result.name}${installed}`);
    if (result.description) {
      lines.push(`  ${result.description}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export async function skillsCommand(args, { cwd, stdout, stderr, fetchImpl = globalThis.fetch }) {
  let parsed;
  try {
    parsed = parseSkillsArgs(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`${message}\n\n${skillsHelpText()}\n`);
    return 1;
  }

  if (parsed.action === "help") {
    stdout.write(`${skillsHelpText()}\n`);
    return 0;
  }

  if (typeof fetchImpl !== "function") {
    stderr.write("Network fetch is unavailable in this runtime.\n");
    return 1;
  }

  try {
    if (parsed.action === "search") {
      const targetDir = resolve(cwd);
      const agentDir = join(targetDir, ".agent");
      const skillNames = await listEccSkills({ fetchImpl });
      const matchingNames = skillNames
        .filter((skillName) => skillMatchesQuery(skillName, parsed.query))
        .slice(0, parsed.limit);

      const results = [];
      for (const name of matchingNames) {
        let description = "";
        try {
          description = extractDescription(await readEccSkill(name, { fetchImpl }));
        } catch {
          description = "";
        }
        results.push({
          name,
          description,
          installed: await exists(join(agentDir, "skills", name, "SKILL.md")),
          source: "ecc",
        });
      }

      stdout.write(parsed.json ? `${JSON.stringify({ results }, null, 2)}\n` : formatSearchResults(results));
      return 0;
    }

    const { name } = parseSkillRef(parsed.skillRef);
    const content = await readEccSkill(name, { fetchImpl });

    if (parsed.action === "show") {
      if (parsed.json) {
        stdout.write(JSON.stringify({
          source: "ecc",
          name,
          description: extractDescription(content),
          url: eccRawUrl(name),
          content,
        }, null, 2));
        stdout.write("\n");
      } else {
        stdout.write(content);
        if (!content.endsWith("\n")) stdout.write("\n");
      }
      return 0;
    }

    const targetDir = resolve(cwd, parsed.target);
    const agentDir = join(targetDir, ".agent");
    const skillDir = join(agentDir, "skills", name);
    const skillPath = join(skillDir, "SKILL.md");
    const originPath = join(skillDir, "ORIGIN.md");
    const localDescription = await readMaybeLocalSkillDescription(agentDir, name);

    if (!(await exists(agentDir))) {
      throw new Error(`No .agent directory found at ${targetDir}. Run 'antigravity-lgpd init' first.`);
    }

    if ((await exists(skillPath)) && !parsed.force) {
      throw new Error(`Skill already exists at ${skillPath}. Re-run with --force to replace it.`);
    }

    const adaptedContent = buildAdaptedSkillContent(content, name, { raw: parsed.raw });
    const originContent = buildOriginFile({ skillName: name, raw: parsed.raw });

    if (parsed.dryRun) {
      stdout.write("Dry run — no files will be modified.\n");
      stdout.write(`Would import ecc/${name} into ${skillDir}\n`);
      if (localDescription) {
        stdout.write(`Existing local skill description: ${localDescription}\n`);
      }
      stdout.write(`Would write ${skillPath}\n`);
      stdout.write(`Would write ${originPath}\n`);
      return 0;
    }

    await mkdir(skillDir, { recursive: true });
    await writeFile(skillPath, adaptedContent, "utf8");
    await writeFile(originPath, originContent, "utf8");

    stdout.write(`Imported ecc/${name} into ${skillDir}\n`);
    stdout.write("Review ORIGIN.md and the skill content before relying on it.\n");
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`Skills command failed: ${message}\n`);
    return 1;
  }
}

export const internals = {
  buildAdaptedSkillContent,
  buildOriginFile,
  extractDescription,
  parseSkillRef,
  parseSkillsArgs,
  skillMatchesQuery,
};
