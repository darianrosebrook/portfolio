#!/usr/bin/env bash
# Bootstrap a CAWS worktree so dev / test / lint commands work from it.
#
# Why: `caws worktree create` clones the git tree but leaves the worktree
# without node_modules or .env.local. Symlinking node_modules from the main
# repo breaks Turbopack ("Symlink points out of the filesystem root"), so a
# real `pnpm install` is required. pnpm hardlinks from the shared content-
# addressable store, which makes this take ~5–10 s, not a full network install.
#
# Usage: from inside the worktree, run:
#   bash scripts/setup-worktree.sh
#
# Idempotent: re-running is safe.

set -euo pipefail

# Resolve the main repo root from the git worktree metadata. A worktree's
# .git is a file containing "gitdir: <path>"; the parent of that path's
# "commondir" file is the main repo's .git.
worktree_root=$(git rev-parse --show-toplevel)
gitdir=$(git rev-parse --git-common-dir)
main_repo=$(dirname "$(cd "$gitdir" && pwd)")

if [[ "$worktree_root" == "$main_repo" ]]; then
  echo "Not in a worktree (or worktree == main repo). Nothing to do."
  exit 0
fi

cd "$worktree_root"

echo "Worktree: $worktree_root"
echo "Main repo: $main_repo"

# 1. Install dependencies. pnpm uses the global store so this hardlinks
# rather than re-downloads.
if [[ ! -d node_modules ]]; then
  echo "Installing dependencies (pnpm install --frozen-lockfile --prefer-offline)..."
  pnpm install --frozen-lockfile --prefer-offline
else
  echo "node_modules already present, skipping install."
fi

# 2. Copy .env.local from the main repo if it exists there and not here.
# We copy (not symlink) so secret-scanner hooks see the file as worktree-local.
if [[ -f "$main_repo/.env.local" && ! -f .env.local ]]; then
  echo "Copying .env.local from main repo..."
  cp "$main_repo/.env.local" .env.local
elif [[ -f .env.local ]]; then
  echo ".env.local already present, skipping."
else
  echo "No .env.local in main repo to copy."
fi

echo "Worktree setup complete. You can now run: npm run dev"
