#!/bin/bash
# CAWS Worktree Write Guard for Claude Code
# Blocks Write/Edit on the base branch while worktrees are active.
# This prevents agents from modifying files on main and then trying to
# create worktrees retroactively to commit them.
# @author @darianrosebrook

set -euo pipefail

# Read JSON input from Claude Code
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
HOOK_CWD=$(echo "$INPUT" | jq -r '.cwd // ""')

# Only check Write and Edit tools
case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

# --- Resolve main repo root ---
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

if command -v git >/dev/null 2>&1; then
  GIT_COMMON_DIR=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
  if [[ -n "$GIT_COMMON_DIR" ]] && [[ "$GIT_COMMON_DIR" != ".git" ]]; then
    CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON_DIR/.." 2>/dev/null && pwd || echo "")
    if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
      PROJECT_DIR="$CANDIDATE"
    fi
  fi
fi

# --- Check for active worktrees ---
if [[ ! -f "$PROJECT_DIR/.caws/worktrees.json" ]]; then
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  exit 0
fi

# Use the hook input's cwd (where the agent is actually working), not
# CLAUDE_PROJECT_DIR (which always points to the main repo root, even when the
# agent has cd'd into a worktree at .caws/worktrees/<name>/).
AGENT_DIR="${HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}"
CURRENT_BRANCH=$(cd "$AGENT_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

WT_INFO=$(node -e "
  try {
    var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
    var active = Object.values(reg.worktrees || {}).filter(function(w) {
      return (w.status === 'active' || w.status === 'fresh' || w.status === 'merged') && w.baseBranch === '$CURRENT_BRANCH';
    });
    console.log(active.length + ':' + active.map(function(w) { return w.name; }).join(', '));
  } catch(e) { console.log('0:'); }
" 2>/dev/null || echo "0:")

WT_COUNT=$(echo "$WT_INFO" | cut -d: -f1)
WT_NAMES=$(echo "$WT_INFO" | cut -d: -f2)

if [[ "$WT_COUNT" -le 0 ]] 2>/dev/null; then
  exit 0
fi

# Main is blocked during active worktree work because shared unstaged state makes
# agents stash, checkpoint, or explain each other's edits. Keep direct main edits
# limited to coordination/docs/scratch paths, then use active spec scope below to
# permit only files no worktree claims.
if [[ -n "$FILE_PATH" ]]; then
  case "$FILE_PATH" in
    .caws/*|*/.caws/*) exit 0 ;;
    .claude/*|*/.claude/*) exit 0 ;;
    .gitignore|*/.gitignore) exit 0 ;;
    .tmp/*|*/.tmp/*) exit 0 ;;
    tmp/*|*/tmp/*) exit 0 ;;
    .archive/*|*/.archive/*) exit 0 ;;
    .githooks/*|*/.githooks/*) exit 0 ;;
    .github/*|*/.github/*) exit 0 ;;
    docs/*|*/docs/*) exit 0 ;;
  esac
fi

if [[ -n "$FILE_PATH" ]]; then
  REL_PATH="$FILE_PATH"
  if [[ "$FILE_PATH" == "$PROJECT_DIR"/* ]]; then
    REL_PATH="${FILE_PATH#$PROJECT_DIR/}"
  fi

  SPEC_CONTENTION_CHECK=$(PROJECT_DIR="$PROJECT_DIR" CURRENT_BRANCH="$CURRENT_BRANCH" REL_PATH="$REL_PATH" node -e "
    var fs = require('fs');
    var path = require('path');
    var yaml;

    try {
      yaml = require('js-yaml');
    } catch (_) {
      console.log('unknown:no-js-yaml');
      process.exit(0);
    }

    function globToRegExp(pattern) {
      return new RegExp(String(pattern).replace(/\\*/g, '.*').replace(/\\?/g, '.'));
    }

    try {
      var projectDir = process.env.PROJECT_DIR;
      var currentBranch = process.env.CURRENT_BRANCH;
      var relPath = process.env.REL_PATH;
      var registryPath = path.join(projectDir, '.caws', 'worktrees.json');
      var registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      var worktrees = Object.values(registry.worktrees || {}).filter(function(w) {
        return (w.status === 'active' || w.status === 'fresh' || w.status === 'merged') && w.baseBranch === currentBranch;
      });

      if (worktrees.length === 0) {
        console.log('unknown:no-registry-worktrees');
        process.exit(0);
      }

      for (var wi = 0; wi < worktrees.length; wi++) {
        var wt = worktrees[wi];
        if (!wt.specId) {
          console.log('unknown:missing-specId:' + (wt.name || 'unnamed'));
          process.exit(0);
        }

        var specPath = path.join(projectDir, '.caws', 'specs', wt.specId + '.yaml');
        if (!fs.existsSync(specPath)) {
          specPath = path.join(projectDir, '.caws', 'specs', wt.specId + '.yml');
        }
        if (!fs.existsSync(specPath)) {
          console.log('unknown:missing-spec:' + wt.specId);
          process.exit(0);
        }

        var spec = yaml.load(fs.readFileSync(specPath, 'utf8')) || {};
        var scope = spec.scope || {};
        var patterns = []
          .concat(Array.isArray(scope.in) ? scope.in : [])
          .concat(Array.isArray(scope.out) ? scope.out : []);

        if (patterns.length === 0) {
          console.log('unknown:missing-scope:' + wt.specId);
          process.exit(0);
        }

        for (var pi = 0; pi < patterns.length; pi++) {
          if (globToRegExp(patterns[pi]).test(relPath)) {
            console.log('claimed:' + (wt.name || wt.specId) + ':' + patterns[pi]);
            process.exit(0);
          }
        }
      }

      console.log('clear');
    } catch (error) {
      console.log('unknown:' + error.message);
    }
  " 2>/dev/null || echo "unknown:node-error")

  if [[ "$SPEC_CONTENTION_CHECK" == "clear" ]]; then
    exit 0
  fi
fi

# Allow edits during an active merge (conflict resolution).
# The worktree-isolation rules explicitly permit merge commits on the base branch.
# Conflict resolution requires Write/Edit on the conflicted files.
MERGE_HEAD_PATH=$(cd "$AGENT_DIR" && git rev-parse --git-dir 2>/dev/null || echo ".git")
if [[ -f "$MERGE_HEAD_PATH/MERGE_HEAD" ]]; then
  exit 0
fi

# Block: we're on the base branch with active worktrees
echo "BLOCKED: Cannot write/edit files on '$CURRENT_BRANCH' while $WT_COUNT worktree(s) are active: $WT_NAMES" >&2
echo "" >&2
echo "You MUST work in a worktree, not on the base branch." >&2
echo "  To use an existing worktree: cd $PROJECT_DIR/.caws/worktrees/<name>/" >&2
echo "  To create a new worktree:    caws worktree create <name>" >&2
echo "" >&2
echo "Do NOT make changes on main and create a worktree retroactively." >&2
echo "The worktree must exist BEFORE you start making changes." >&2
echo "" >&2
echo "If you are merging a worktree branch, use: caws worktree merge <name>" >&2
echo "Or start the merge first (git merge --no-ff <branch>), then resolve conflicts." >&2
exit 2
