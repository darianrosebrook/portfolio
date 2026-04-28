---
description: Git safety rules for all agents
globs:
---

# Git Safety

## Commit discipline

- Commit after each logical unit of work (a module + its tests, a bugfix, a refactor pass)
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `perf:`
- Never accumulate uncommitted changes across multiple unrelated concerns
- Never leave uncommitted changes at session end; commit as `wip(<scope>): <description>` if incomplete

## Forbidden operations

- `git push --force` or `git push -f` -- never rewrite remote history
- `git reset --hard` -- use `git stash` or `git checkout -- <file>` for targeted reverts (but not during parallel work)
- `git clean -f` -- may delete another agent's untracked files
- `git checkout .` or `git restore .` -- bulk discard is dangerous

## Branch hygiene

- Work on feature branches, not directly on main/master
- One concern per branch
- Delete branches after merging
