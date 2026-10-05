# Claude Code Integration for CAWS

CAWS guards for this repo run from the machine runtime in `~/.caws`, wired
once at user scope. Nothing in this directory executes a CAWS guard.

## Layout

```
.claude/
  settings.json              # permissions + the repo-local PostToolUse hook below
  hooks/
    doc-frontmatter-check.sh # repo-local advisory (not part of CAWS)
  rules/                     # agent rules loaded into every session
  logs/                      # audit / strike state (gitignored)
```

## Wiring

`~/.claude/settings.json` registers
`python3 ~/.caws/bin/caws-hook claude-code <event> --system` for every
lifecycle event (PreToolUse, PostToolUse, SessionStart, Stop, PreCompact,
SessionEnd). The runtime picks the stock handlers from the active snapshot
and applies this project's surface policy, stored at
`~/.caws/state/projects/<canonical-path-hash>.json`. The policy is empty:
no stock handler is disabled and no local handler is added.

Do not register CAWS dispatchers in `.claude/settings.json`. A project
registration takes precedence over the system transport and would pin this
repo to whatever handler copies it points at. Add only **repo-local** checks
here, as `doc-frontmatter-check.sh` is.

## Maintenance

```bash
caws doctor                  # runtime integrity and residual local registration
caws init adapters install   # install a new verified runtime snapshot (all adopted projects)
```

Native hooks load at session start; verify a fresh session after changing
the user-level registration. See `../caws/docs/guides/hook-packs.md` for the
machine adapter model.
