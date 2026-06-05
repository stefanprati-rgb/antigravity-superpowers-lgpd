#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo " Antigravity Profile Test Runner"
echo "========================================"
echo ""

bash "$SCRIPT_DIR/check-antigravity-profile.sh"
node "$SCRIPT_DIR/prompt-regression.mjs"
node "$SCRIPT_DIR/check-profile-isolation.mjs"
