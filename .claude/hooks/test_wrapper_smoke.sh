#!/bin/bash
# Smoke tests for block-dangerous.sh shell wrapper.
# Feeds synthetic PreToolUse JSON and asserts the output JSON shape.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/block-dangerous.sh"

PASS=0
FAIL=0

run_test() {
  local name="$1"
  local command="$2"
  local expected_decision="$3"

  local input
  input=$(jq -n --arg cmd "$command" '{
    tool_name: "Bash",
    tool_input: { command: $cmd }
  }')

  local output
  output=$(printf '%s' "$input" | CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}" bash "$HOOK" 2>/dev/null) || true

  if [[ -z "$output" ]]; then
    # No output = allow (hook exits 0 with no JSON)
    if [[ "$expected_decision" == "allow" ]]; then
      echo "  [PASS] $name"
      PASS=$((PASS + 1))
    else
      echo "  [FAIL] $name: expected=$expected_decision, got=allow (no output)"
      FAIL=$((FAIL + 1))
    fi
    return
  fi

  local decision
  decision=$(printf '%s' "$output" | jq -r '.hookSpecificOutput.permissionDecision // "missing"')
  local reason
  reason=$(printf '%s' "$output" | jq -r '.hookSpecificOutput.permissionDecisionReason // ""')
  local event
  event=$(printf '%s' "$output" | jq -r '.hookSpecificOutput.hookEventName // "missing"')

  # Verify JSON shape
  if [[ "$event" != "PreToolUse" ]] && [[ "$expected_decision" != "allow" ]]; then
    echo "  [FAIL] $name: hookEventName=$event, expected=PreToolUse"
    FAIL=$((FAIL + 1))
    return
  fi

  if [[ "$decision" == "$expected_decision" ]]; then
    echo "  [PASS] $name (reason: $reason)"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $name: expected=$expected_decision, got=$decision (reason: $reason)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Wrapper smoke tests ==="

# Allow cases
run_test "normal command" "ls -la" "allow"
run_test "cargo test" "cargo test --workspace" "allow"
run_test "safe rm" "rm -rf target/debug" "allow"

# Deny cases
run_test "rm root" "rm -rf /" "deny"
run_test "dd zero" "dd if=/dev/zero of=/dev/sda" "deny"

# Ask cases
run_test "git reset hard" "git reset --hard" "ask"
run_test "rm src" "rm -rf src/" "ask"
run_test "git init" "git init" "ask"

# Non-Bash tool should pass through (no output)
NON_BASH_INPUT='{"tool_name":"Read","tool_input":{"file_path":"/etc/passwd"}}'
NON_BASH_OUTPUT=$(printf '%s' "$NON_BASH_INPUT" | bash "$HOOK" 2>/dev/null) || true
if [[ -z "$NON_BASH_OUTPUT" ]]; then
  echo "  [PASS] non-Bash tool passthrough"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] non-Bash tool should produce no output, got: $NON_BASH_OUTPUT"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "=========================================="
echo "Results: $PASS passed, $FAIL failed"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
else
  echo "ALL WRAPPER SMOKE TESTS PASSED"
  exit 0
fi
