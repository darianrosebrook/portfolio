#!/bin/bash
# CAWS Audit Hook for Claude Code
# Logs agent actions for compliance and debugging
# @author @darianrosebrook

set -euo pipefail

# Get event type from argument or input
EVENT_TYPE="${1:-tool-use}"

# Read JSON input from stdin
INPUT=$(cat)

# Parse common fields from Claude Code hook input
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
PERMISSION_MODE=$(echo "$INPUT" | jq -r '.permission_mode // "default"')

# Ensure log directory exists
LOG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/logs"
mkdir -p "$LOG_DIR"

# Log file path
LOG_FILE="$LOG_DIR/audit.log"
DATE_LOG_FILE="$LOG_DIR/audit-$(date +%Y-%m-%d).log"

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build log entry based on event type
case "$EVENT_TYPE" in
  session-start)
    SOURCE=$(echo "$INPUT" | jq -r '.source // "unknown"')
    MODEL=$(echo "$INPUT" | jq -r '.model // "unknown"')
    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "session_start" \
      --arg source "$SOURCE" \
      --arg model "$MODEL" \
      --arg cwd "$CWD" \
      '{timestamp: $ts, session_id: $sid, event: $event, source: $source, model: $model, cwd: $cwd}')
    ;;

  stop)
    STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "session_stop" \
      --arg cwd "$CWD" \
      --argjson hook_active "$STOP_HOOK_ACTIVE" \
      '{timestamp: $ts, session_id: $sid, event: $event, cwd: $cwd, stop_hook_active: $hook_active}')
    ;;

  tool-use)
    # Extract tool-specific info
    TOOL_INPUT=$(echo "$INPUT" | jq -c '.tool_input // {}')
    TOOL_RESPONSE=$(echo "$INPUT" | jq -c '.tool_response // {}')
    TOOL_USE_ID=$(echo "$INPUT" | jq -r '.tool_use_id // ""')

    # For file operations, extract the path
    FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // ""')
    COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // ""')

    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "tool_use" \
      --arg tool "$TOOL_NAME" \
      --arg file "$FILE_PATH" \
      --arg cmd "$COMMAND" \
      --arg cwd "$CWD" \
      --arg mode "$PERMISSION_MODE" \
      '{timestamp: $ts, session_id: $sid, event: $event, tool: $tool, file: $file, command: $cmd, cwd: $cwd, permission_mode: $mode}')
    ;;

  *)
    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "$EVENT_TYPE" \
      --arg hook "$HOOK_EVENT" \
      --arg cwd "$CWD" \
      '{timestamp: $ts, session_id: $sid, event: $event, hook_event: $hook, cwd: $cwd}')
    ;;
esac

# --- Log rotation ---
# Keep main audit.log under 10MB; keep date-logs for 30 days
rotate_logs() {
  # Rotate main audit.log at 10MB
  if [[ -f "$LOG_FILE" ]]; then
    local size
    size=$(wc -c < "$LOG_FILE" 2>/dev/null | tr -d ' ')
    if [[ "$size" -gt 10485760 ]]; then
      # Keep last rotated copy, discard older
      [[ -f "${LOG_FILE}.1" ]] && rm -f "${LOG_FILE}.1"
      mv "$LOG_FILE" "${LOG_FILE}.1"
    fi
  fi

  # Prune date-based logs older than 30 days
  if [[ -d "$LOG_DIR" ]]; then
    find "$LOG_DIR" -name 'audit-*.log' -type f -mtime +30 -delete 2>/dev/null || true
  fi
}

# Run rotation check ~1% of the time (avoid stat overhead on every tool call)
if [[ $(( RANDOM % 100 )) -eq 0 ]]; then
  rotate_logs
fi

# Append to log files
echo "$LOG_ENTRY" >> "$LOG_FILE"
echo "$LOG_ENTRY" >> "$DATE_LOG_FILE"

# Success - allow operation to continue
exit 0
