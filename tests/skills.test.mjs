import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";

import { internals, skillsCommand } from "../src/commands/skills.js";

const SAMPLE_SKILLS = [
  { name: "ai-regression-testing", type: "dir" },
  { name: "search-first", type: "dir" },
  { name: "token-budget-advisor", type: "dir" },
];

const SAMPLE_CONTENT = `---
name: ai-regression-testing
description: Regression testing strategies for AI-assisted development.
metadata:
  origin: ECC
---

# AI Regression Testing

Use Claude Code regression patterns as a starting point.
`;

function createResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return body;
    },
  };
}

function createFakeFetch() {
  return async (url) => {
    if (url.includes("/contents/skills")) {
      return createResponse(JSON.stringify(SAMPLE_SKILLS));
    }

    if (url.includes("/skills/ai-regression-testing/SKILL.md")) {
      return createResponse(SAMPLE_CONTENT);
    }

    if (url.includes("/skills/search-first/SKILL.md")) {
      return createResponse(`---
name: search-first
description: Research before coding.
---

# Search First
`);
    }

    return createResponse("not found", 404);
  };
}

function createIo(cwd, fetchImpl = createFakeFetch()) {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      cwd,
      fetchImpl,
      stdout: {
        write(value) {
          stdout += value;
        },
      },
      stderr: {
        write(value) {
          stderr += value;
        },
      },
    },
    output() {
      return { stdout, stderr };
    },
  };
}

async function pathExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function createTempProject(prefix) {
  const projectDir = await mkdtemp(join(tmpdir(), prefix));
  await mkdir(join(projectDir, ".agent", "skills"), { recursive: true });
  return projectDir;
}

test("skills search lists matching ECC skills without installing them", async () => {
  const projectDir = await createTempProject("agsp-skills-search-");

  try {
    const { io, output } = createIo(projectDir);
    const status = await skillsCommand(["search", "regression"], io);
    const { stdout, stderr } = output();

    assert.equal(status, 0);
    assert.equal(stderr, "");
    assert.match(stdout, /ecc\/ai-regression-testing/);
    assert.match(stdout, /Regression testing strategies/);
    assert.equal(await pathExists(join(projectDir, ".agent", "skills", "ai-regression-testing")), false);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("skills import --dry-run reports intended files without writing", async () => {
  const projectDir = await createTempProject("agsp-skills-dryrun-");

  try {
    const { io, output } = createIo(projectDir);
    const status = await skillsCommand(["import", "ecc/ai-regression-testing", "--dry-run"], io);
    const { stdout } = output();

    assert.equal(status, 0);
    assert.match(stdout, /Dry run/);
    assert.match(stdout, /Would import ecc\/ai-regression-testing/);
    assert.equal(
      await pathExists(join(projectDir, ".agent", "skills", "ai-regression-testing", "SKILL.md")),
      false,
    );
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("skills import writes adapted skill and origin metadata", async () => {
  const projectDir = await createTempProject("agsp-skills-import-");

  try {
    const { io, output } = createIo(projectDir);
    const status = await skillsCommand(["import", "ecc/ai-regression-testing"], io);
    const { stdout, stderr } = output();

    assert.equal(status, 0);
    assert.equal(stderr, "");
    assert.match(stdout, /Imported ecc\/ai-regression-testing/);

    const skillPath = join(projectDir, ".agent", "skills", "ai-regression-testing", "SKILL.md");
    const originPath = join(projectDir, ".agent", "skills", "ai-regression-testing", "ORIGIN.md");
    const skill = await readFile(skillPath, "utf8");
    const origin = await readFile(originPath, "utf8");

    assert.match(skill, /Imported from ECC/);
    assert.match(skill, /Codex\/Gemini/);
    assert.match(origin, /Source: ECC/);
    assert.match(origin, /Reviewed: false/);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("skills import refuses to replace existing skill without --force", async () => {
  const projectDir = await createTempProject("agsp-skills-existing-");

  try {
    const existingDir = join(projectDir, ".agent", "skills", "ai-regression-testing");
    await mkdir(existingDir, { recursive: true });
    await writeFile(join(existingDir, "SKILL.md"), "---\nname: local\n---\n", "utf8");

    const { io, output } = createIo(projectDir);
    const status = await skillsCommand(["import", "ecc/ai-regression-testing"], io);
    const { stderr } = output();

    assert.equal(status, 1);
    assert.match(stderr, /already exists/);
    assert.match(stderr, /--force/);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

test("skills parser accepts only ecc skill refs", () => {
  assert.deepEqual(internals.parseSkillRef("ecc/search-first"), {
    source: "ecc",
    name: "search-first",
  });
  assert.throws(() => internals.parseSkillRef("claude/search-first"), /Unsupported skill ref/);
  assert.throws(() => internals.parseSkillRef("ecc/../bad"), /Unsupported skill ref/);
});
