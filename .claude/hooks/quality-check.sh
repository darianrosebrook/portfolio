#!/bin/bash
# CAWS Quality Check Hook for Claude Code
# Runs CAWS quality validation after file edits
# @author @darianrosebrook

set -euo pipefail

# Read JSON input from Claude Code
INPUT=$(cat)

# Extract file info from PostToolUse input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')

# Only run on Write/Edit of source files
if [[ "$TOOL_NAME" != "Write" ]] && [[ "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

# Skip non-source files and node_modules/dist
if [[ ! "$FILE_PATH" =~ \.(js|ts|jsx|tsx|py|go|rs|java|mjs|cjs)$ ]] || \
   [[ "$FILE_PATH" =~ node_modules ]] || \
   [[ "$FILE_PATH" =~ dist/ ]] || \
   [[ "$FILE_PATH" =~ build/ ]]; then
  exit 0
fi

# Determine project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Check if we're in a CAWS project
if [[ ! -f "$PROJECT_DIR/.caws/working-spec.yaml" ]] && [[ ! -d "$PROJECT_DIR/.caws/specs" ]]; then
  exit 0
fi

# Check if CAWS CLI is available
if ! command -v caws &> /dev/null; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "CAWS CLI not available. Consider installing with: npm install -g @paths.design/caws-cli"
    }
  }'
  exit 0
fi

# Run quality gates via the unified pipeline
RESULT=$(caws gates run --context=edit --file "$FILE_PATH" --json --quiet 2>&1) || GATE_EXIT=$?

if [ -z "$RESULT" ]; then
  # No output — gates command not available or errored
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Quality gates did not produce output (exit '"${GATE_EXIT:-0}"'). Run '\''caws gates run'\'' for details."
    }
  }'
  exit 0
fi

# Check if gates passed
PASSED=$(echo "$RESULT" | jq -r '.passed // true' 2>/dev/null)

if [ "$PASSED" = "true" ]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Quality gates passed for this change."
    }
  }'
else
  # Extract top 3 gate failure messages
  VIOLATIONS=$(echo "$RESULT" | jq -r '[.gates[] | select(.status == "fail") | "- \(.name): \(.messages[0] // "failed")"] | .[0:3] | .[]' 2>/dev/null || echo "Run 'caws gates run' for details")

  echo '{
    "decision": "block",
    "reason": "Quality gate violations detected. Please address the following issues before continuing:\n'"$VIOLATIONS"'\n\nRun '\''caws gates run'\'' for full details."
  }'
fi

exit 0
