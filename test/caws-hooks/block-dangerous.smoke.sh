#!/bin/bash
# Thin smoke for the shared CAWS block-dangerous wrapper (pack v31+).
# Full classify_command coverage lives upstream in caws-cli; this only checks
# that the installed wrapper emits a block for a catastrophic command and
# stays silent for a safe one.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK="$ROOT/.caws/hooks/block-dangerous.sh"
SESSION="portfolio-smoke-$$"

cleanup() {
  rm -f "$ROOT/.claude/hooks/state/danger-latch-${SESSION}.json" 2>/dev/null || true
}
trap cleanup EXIT

run() {
  local cmd="$1"
  printf '%s' "$(jq -n --arg cmd "$cmd" --arg cwd "$ROOT" --arg sid "$SESSION" \
    '{tool_name:"Bash", tool_input:{command:$cmd}, cwd:$cwd, session_id:$sid}')" \
    | CAWS_AGENT_SURFACE=claude-code \
      CAWS_PROJECT_DIR="$ROOT" \
      CLAUDE_PROJECT_DIR="$ROOT" \
      bash "$HOOK" 2>/dev/null || true
}

# Safe command: no block envelope.
safe_out="$(run 'ls -la')"
if [[ -n "$safe_out" ]] && echo "$safe_out" | jq -e '
  (.decision == "block")
  or (.hookSpecificOutput.permissionDecision == "deny")
' >/dev/null 2>&1; then
  echo "[FAIL] safe command was blocked: $safe_out"
  exit 1
fi
echo "[PASS] safe command allowed"

# Catastrophic command: must block (flat or nested envelope).
deny_out="$(run 'rm -rf /')"
if ! echo "$deny_out" | jq -e '
  (.decision == "block")
  or (.hookSpecificOutput.permissionDecision == "deny")
' >/dev/null 2>&1; then
  echo "[FAIL] catastrophic command was not blocked: $deny_out"
  exit 1
fi
echo "[PASS] catastrophic command blocked"

echo "ALL WRAPPER SMOKE TESTS PASSED"
