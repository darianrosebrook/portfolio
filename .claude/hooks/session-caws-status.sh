#!/bin/bash
# CAWS Session Status Hook for Claude Code
# Reports project state at session start with worktree warnings
# @author @darianrosebrook

set -euo pipefail

# Read stdin (required by hook protocol)
INPUT=$(cat)

# Only run for session-start events
EVENT_TYPE="${1:-}"
if [ "$EVENT_TYPE" != "session-start" ]; then
  exit 0
fi

# Check if this is a CAWS project
if [ ! -d "${CLAUDE_PROJECT_DIR:-.}/.caws" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# --- Resolve main repo root ---
CAWS_ROOT="."
if command -v git >/dev/null 2>&1; then
  _GIT_COMMON=$(git rev-parse --git-common-dir 2>/dev/null || echo ".git")
  if [ "$_GIT_COMMON" != ".git" ]; then
    _CANDIDATE=$(cd "$_GIT_COMMON/.." 2>/dev/null && pwd || echo "")
    if [ -n "$_CANDIDATE" ] && [ -d "$_CANDIDATE/.caws" ]; then
      CAWS_ROOT="$_CANDIDATE"
    fi
  fi
fi

# --- Active worktree warning ---
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

if [ -f "$CAWS_ROOT/.caws/worktrees.json" ] && command -v node >/dev/null 2>&1; then
  WT_INFO=$(node -e "
    try {
      var reg = JSON.parse(require('fs').readFileSync('$CAWS_ROOT/.caws/worktrees.json', 'utf8'));
      var active = Object.values(reg.worktrees || {}).filter(function(w) { return w.status === 'active' || w.status === 'fresh' || w.status === 'merged'; });
      if (active.length > 0) {
        var names = active.map(function(w) { return w.name + ' (' + w.branch + ')'; });
        console.log(active.length + ':' + names.join(', '));
      } else {
        console.log('0:');
      }
    } catch(e) { console.log('0:'); }
  " 2>/dev/null || echo "0:")

  WT_COUNT=$(echo "$WT_INFO" | cut -d: -f1)
  WT_NAMES=$(echo "$WT_INFO" | cut -d: -f2)

  if [ "$WT_COUNT" -gt 0 ] 2>/dev/null; then
    # Check if the agent is already in a worktree (not on the base branch)
    BASE_BRANCH=$(node -e "
      try {
        var reg = JSON.parse(require('fs').readFileSync('$CAWS_ROOT/.caws/worktrees.json', 'utf8'));
        var active = Object.values(reg.worktrees || {}).filter(function(w) { return w.status === 'active' || w.status === 'fresh' || w.status === 'merged'; });
        if (active.length > 0) console.log(active[0].baseBranch || '');
        else console.log('');
      } catch(e) { console.log(''); }
    " 2>/dev/null || echo "")

    echo ""
    echo "================================================================"
    echo "  ACTIVE WORKTREES DETECTED: $WT_COUNT worktree(s)"
    echo "  $WT_NAMES"
    echo "================================================================"

    if [ -n "$BASE_BRANCH" ] && [ "$CURRENT_BRANCH" = "$BASE_BRANCH" ]; then
      echo ""
      echo "  You MUST work in a worktree, not on $CURRENT_BRANCH."
      echo ""
      echo "  If a worktree was created for your task:"
      echo "    cd $CAWS_ROOT/.caws/worktrees/<name>/"
      echo ""
      echo "  If you need a new worktree:"
      echo "    caws worktree create <name>"
      echo ""
      echo "  The only operations allowed on $CURRENT_BRANCH are:"
      echo "    - git merge --no-ff <branch> (merge completed worktree work)"
      echo "    - Commits with message: merge(worktree): <description>"
      echo "    - Commits with message: wip(checkpoint): <description>"
      echo "      (for committing prior-session dirty files)"
      echo ""
      echo "  Writing or editing files on $CURRENT_BRANCH will be BLOCKED"
      echo "  by the PreToolUse hook while worktrees are active."
    else
      echo ""
      echo "  You are on branch '$CURRENT_BRANCH' (worktree). Good."
      echo "  Other active worktrees: $WT_NAMES"
    fi
    echo "================================================================"
    echo ""
  fi
fi

# Use caws session briefing for structured output
if command -v caws &>/dev/null; then
  caws session briefing 2>/dev/null || {
    echo "--- CAWS Session Briefing (fallback) ---"
    HEAD_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
    DIRTY_COUNT=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    echo "Git: ${BRANCH} @ ${HEAD_SHA} (${DIRTY_COUNT} dirty files)"
    if [ "$DIRTY_COUNT" -gt 0 ]; then
      echo "WARNING: Working tree has uncommitted changes from a prior session."
      echo "Classify and commit or stash them before starting new work."
    fi
    echo "--- End CAWS Briefing ---"
  }
fi

exit 0
