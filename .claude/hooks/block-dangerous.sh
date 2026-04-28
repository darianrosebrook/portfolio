#!/bin/bash
# CAWS Command Safety Gate for Claude Code
# Delegates to classify_command.py for robust command parsing and classification.
# Falls back to bash pattern matching if Python is unavailable.
#
# The Python classifier handles:
#   - Heredoc-aware parsing (won't false-positive on quoted dangerous commands)
#   - Quoted-region stripping (echo "git reset --hard" is safe)
#   - Pipeline-aware dangers (curl | sh)
#   - Context-aware rm classification (safe prefixes vs dangerous targets)
#   - Proper shell segmentation (&&, ||, ;, |)
#
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Read JSON input from Claude Code
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.tool_name // ""')
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')

# Only check Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# --- Try Python classifier first (preferred) ---
CLASSIFIER="$SCRIPT_DIR/classify_command.py"
if [[ -f "$CLASSIFIER" ]] && command -v python3 >/dev/null 2>&1; then
  REPO_ROOT="${CLAUDE_PROJECT_DIR:-.}"
  CLASSIFIER_STDERR=$(mktemp)
  RESULT=$(printf '%s' "$COMMAND" | python3 "$CLASSIFIER" \
    --repo-root "$REPO_ROOT" \
    --home "$HOME" \
    --cwd "$(pwd)" 2>"$CLASSIFIER_STDERR") || {
    DIAG=$(head -c 200 "$CLASSIFIER_STDERR" 2>/dev/null || true)
    rm -f "$CLASSIFIER_STDERR"
    RESULT="{\"decision\":\"ask\",\"reason\":\"command classifier failed: ${DIAG:-unknown error}\"}"
  }
  rm -f "$CLASSIFIER_STDERR"

  DECISION=$(printf '%s' "$RESULT" | jq -r '.decision // "ask"')
  REASON=$(printf '%s' "$RESULT" | jq -r '.reason // "unknown"')

  case "$DECISION" in
    allow)
      exit 0
      ;;
    deny)
      echo "BLOCKED: $REASON" >&2
      echo "Command was: $COMMAND" >&2
      exit 2
      ;;
    ask)
      echo "WARNING: $REASON" >&2
      echo "Command was: $COMMAND" >&2
      exit 1
      ;;
  esac
fi

# --- Fallback: bash pattern matching (less precise, no heredoc/quote awareness) ---

DANGEROUS_PATTERNS=(
  # Destructive file operations
  'rm -rf /'
  'rm -rf ~'
  'rm -rf \*'
  'rm -rf \.'
  'rm -rf /\*'
  'dd if=/dev/zero'
  'dd if=/dev/random'
  'mkfs\.'
  'fdisk'
  '> /dev/sd'

  # Fork bombs and resource exhaustion
  ':\(\)\{:\|:\&\};:'
  'while true.*fork'

  # Credential/secret exposure
  'cat.*\.env'
  'cat.*/etc/passwd'
  'cat.*/etc/shadow'
  'cat.*id_rsa'
  'cat.*\.ssh/'
  'cat.*credentials'
  'cat.*\.aws/'

  # Network exfiltration
  'curl.*\|.*sh'
  'wget.*\|.*sh'
  'curl.*\|.*bash'
  'wget.*\|.*bash'

  # Permission escalation
  'chmod 777'
  'chmod -R 777'
  'chmod.*\+s'

  # History manipulation
  'history -c'
  'rm.*\.bash_history'
  'rm.*\.zsh_history'

  # System modification
  'shutdown'
  'reboot'
  'init 0'
  'init 6'

  # Git destructive operations
  'git init'
  'git reset --hard'
  'git push --force'
  'git push -f '
  'git push --force-with-lease'
  'git clean -f'
  'git checkout \.'
  'git restore \.'
  '(^|&&|\|\||;|\|)\s*git rebase'
  '(^|&&|\|\||;|\|)\s*git cherry-pick'

  # Virtual environment creation (prevents venv sprawl)
  'python -m venv'
  'python3 -m venv'
  'virtualenv '
  'conda create'
)

# Check command against dangerous patterns
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    # Allow git init in worktree context
    if [[ "$pattern" == "git init" ]] && [[ "${CAWS_WORKTREE_CONTEXT:-0}" == "1" ]]; then
      continue
    fi

    # Allow git rebase/cherry-pick only when no worktrees are active
    if [[ "$pattern" == *"git rebase"* ]] || [[ "$pattern" == *"git cherry-pick"* ]]; then
      PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
      if command -v git >/dev/null 2>&1; then
        GIT_COMMON=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
        if [[ -n "$GIT_COMMON" ]] && [[ "$GIT_COMMON" != ".git" ]]; then
          CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON/.." 2>/dev/null && pwd || echo "")
          if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
            PROJECT_DIR="$CANDIDATE"
          fi
        fi
      fi
      WT_FILE="$PROJECT_DIR/.caws/worktrees.json"
      if [[ -f "$WT_FILE" ]] && command -v node >/dev/null 2>&1; then
        ACTIVE_COUNT=$(node -e "
          try {
            var r = JSON.parse(require('fs').readFileSync('$WT_FILE','utf8'));
            var c = Object.values(r.worktrees||{}).filter(function(w){return w.status==='active';}).length;
            console.log(c);
          } catch(e) { console.log(0); }
        " 2>/dev/null || echo "0")
        if [[ "$ACTIVE_COUNT" -gt 0 ]]; then
          GIT_SUBCMD="git operation"
          [[ "$pattern" == *"git rebase"* ]] && GIT_SUBCMD="git rebase"
          [[ "$pattern" == *"git cherry-pick"* ]] && GIT_SUBCMD="git cherry-pick"
          echo "BLOCKED: $GIT_SUBCMD is forbidden while $ACTIVE_COUNT worktree(s) are active." >&2
          echo "This can replay or rewrite commits across worktree boundaries." >&2
          echo "Command was: $COMMAND" >&2
          exit 2
        fi
      fi
      continue
    fi

    # Allow venv commands if target matches designated venv path from scope.json
    if echo "$pattern" | grep -qE '(python.*venv|virtualenv|conda create)'; then
      PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
      SCOPE_FILE="$PROJECT_DIR/.caws/scope.json"
      if [[ -f "$SCOPE_FILE" ]] && command -v node >/dev/null 2>&1; then
        DESIGNATED_VENV=$(node -e "try { const s = JSON.parse(require('fs').readFileSync('$SCOPE_FILE','utf8')); console.log(s.designatedVenvPath || ''); } catch(e) { console.log(''); }" 2>/dev/null || echo "")
        if [[ -n "$DESIGNATED_VENV" ]] && echo "$COMMAND" | grep -qF "$DESIGNATED_VENV"; then
          continue
        fi
      fi
    fi

    echo "BLOCKED: Command matches dangerous pattern: $pattern" >&2
    echo "Command was: $COMMAND" >&2
    exit 2
  fi
done

# Check for sudo without specific allowed commands
if echo "$COMMAND" | grep -qE '^sudo\s' && ! echo "$COMMAND" | grep -qE 'sudo (npm|yarn|pnpm|brew|apt-get|apt|dnf|yum)'; then
  echo "BLOCKED: sudo commands require explicit approval" >&2
  echo "If this command is safe, please run it manually in your terminal" >&2
  exit 2
fi

# Allow the command
exit 0
