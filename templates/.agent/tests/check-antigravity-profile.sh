#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$AGENT_DIR/.." && pwd)"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "  [PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "  [FAIL] $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

require_file() {
  local path="$1"
  if [ -f "$path" ]; then
    pass "File exists: $path"
  else
    fail "Missing file: $path"
  fi
}

require_absent() {
  local path="$1"
  if [ ! -e "$path" ]; then
    pass "File absent (as expected): $path"
  else
    fail "File should be absent: $path"
  fi
}

has_pattern() {
  local pattern="$1"
  local path="$2"
  if command -v rg >/dev/null 2>&1; then
    rg -q "$pattern" "$path"
  else
    grep -Eq "$pattern" "$path"
  fi
}

tree_has_pattern() {
  local pattern="$1"
  local path="$2"
  if command -v rg >/dev/null 2>&1; then
    rg -q "$pattern" "$path"
  else
    grep -REq "$pattern" "$path"
  fi
}

echo "========================================"
echo " Antigravity Profile Checks"
echo "========================================"
echo ""

echo "Checking required files..."

required_files=(
  "$AGENT_DIR/AGENTS.md"
  "$AGENT_DIR/INSTALL.md"
  "$AGENT_DIR/task.md"
  "$AGENT_DIR/task.json"
  "$AGENT_DIR/workflows/brainstorm.md"
  "$AGENT_DIR/workflows/write-plan.md"
  "$AGENT_DIR/workflows/execute-plan.md"
  "$AGENT_DIR/agents/code-reviewer.md"
  "$AGENT_DIR/tools/lgpd-pre-commit.mjs"
  "$AGENT_DIR/tools/render-task-md.mjs"
  "$SCRIPT_DIR/prompt-regression.mjs"
  "$SCRIPT_DIR/check-antigravity-profile.sh"
  "$SCRIPT_DIR/run-tests.sh"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

require_absent "$ROOT_DIR/docs/plans/task.json"
require_absent "$ROOT_DIR/docs/plans/task.md"

required_skills=(
  "executing-plans"
  "systematic-debugging"
  "test-driven-development"
  "using-superpowers"
  "verification-before-completion"
  "writing-plans"
  "single-flow-task-execution"
  "project-onboarding"
  "handling-personal-data"
  "clean-architecture-enforcer"
)

for skill in "${required_skills[@]}"; do
  require_file "$AGENT_DIR/skills/$skill/SKILL.md"
done

# Verify prompt template files for single-flow-task-execution
require_file "$AGENT_DIR/skills/single-flow-task-execution/implementer-prompt.md"
require_file "$AGENT_DIR/skills/single-flow-task-execution/spec-reviewer-prompt.md"
require_file "$AGENT_DIR/skills/single-flow-task-execution/code-quality-reviewer-prompt.md"

echo ""
echo "Checking frontmatter..."

for skill in "${required_skills[@]}"; do
  file="$AGENT_DIR/skills/$skill/SKILL.md"

  if has_pattern '^---?$' "$file"; then
    pass "$skill has frontmatter delimiters"
  else
    fail "$skill missing frontmatter delimiters"
  fi

  if has_pattern '^name:[[:space:]]*[^[:space:]].*$' "$file"; then
    pass "$skill has name field"
  else
    fail "$skill missing name field"
  fi

  if has_pattern '^description:[[:space:]]*[^[:space:]].*$' "$file"; then
    pass "$skill has description field"
  else
    fail "$skill missing description field"
  fi
done

echo ""
echo "Checking for unsupported legacy instructions..."

legacy_patterns=(
  'Skill tool'
  'Task tool with'
  'Task\("'
  'Dispatch implementer subagent'
  'Dispatch code-reviewer subagent'
  'Create TodoWrite'
  'Mark task complete in TodoWrite'
  'Use TodoWrite'
  'superpowers:'
)

for pattern in "${legacy_patterns[@]}"; do
  if tree_has_pattern "$pattern" "$AGENT_DIR/skills"; then
    fail "Legacy pattern found in skills: $pattern"
  else
    pass "Legacy pattern absent: $pattern"
  fi
done

echo ""
echo "Checking AGENTS mapping contract..."

mapping_checks=(
  'browser_subagent'
  'Skill.*view_file'
  'TodoWrite.*docs/plans/task\.md'
  'docs/plans/task\.json'
)

for pattern in "${mapping_checks[@]}"; do
  if has_pattern "$pattern" "$AGENT_DIR/AGENTS.md"; then
    pass "AGENTS includes mapping: $pattern"
  else
    fail "AGENTS missing mapping: $pattern"
  fi
done

echo ""
echo "Running prompt regression checks..."
if node "$SCRIPT_DIR/prompt-regression.mjs"; then
  pass "Prompt regression checks passed"
else
  fail "Prompt regression checks failed"
fi

echo ""
echo "========================================"
echo " Summary"
echo "========================================"
echo "  Passed: $PASS_COUNT"
echo "  Failed: $FAIL_COUNT"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "STATUS: FAILED"
  exit 1
fi

echo "STATUS: PASSED"
