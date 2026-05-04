#!/bin/bash
# Track git hook bypasses for security audit
# Called automatically when --no-verify is used

LOG_FILE="$HOME/.git-hook-bypass-log.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REPO_PATH=$(git rev-parse --show-toplevel 2>/dev/null || echo "unknown")
REPO_NAME=$(basename "$REPO_PATH" 2>/dev/null || echo "unknown")
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "pre-commit")
USER=$(whoami)
EMAIL=$(git config user.email 2>/dev/null || echo "unknown")

# Create log entry
LOG_ENTRY=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "repo": "$REPO_NAME",
  "repo_path": "$REPO_PATH",
  "commit": "$COMMIT_HASH",
  "user": "$USER",
  "email": "$EMAIL",
  "hook": "pre-commit",
  "reason": "manual-bypass",
  "command": "$*"
}
EOF
)

# Append to log file (create if doesn't exist)
if [ ! -f "$LOG_FILE" ]; then
  echo "[" > "$LOG_FILE"
  echo "$LOG_ENTRY" >> "$LOG_FILE"
  echo "]" >> "$LOG_FILE"
else
  # Remove last ] and add entry with comma
  sed -i '' '$ d' "$LOG_FILE"
  echo "," >> "$LOG_FILE"
  echo "$LOG_ENTRY" >> "$LOG_FILE"
  echo "]" >> "$LOG_FILE"
fi

# Also log to git notes if available
if git notes list > /dev/null 2>&1; then
  git notes append -m "Hook bypass: pre-commit at $TIMESTAMP by $USER ($EMAIL)" > /dev/null 2>&1 || true
fi

echo "⚠️  Hook bypass logged to: $LOG_FILE"











