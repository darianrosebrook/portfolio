# Claude Code Integration for CAWS (v11.9)

Claude Code is a **vendor adapter** over the shared CAWS hook core.

## Layout (CAWS-HOOK-PACK-SHARED-CORE-001)

```
.caws/hooks/                 # shared core (dispatchers + all guards/checks)
  dispatch/                  # pre_tool_use, post_tool_use, session_start, stop, pre_compact
  lib/                       # parse-input, run-handlers, emit, agent-surface, ...
  <shared hooks>.sh          # scope-guard, block-dangerous, worktree-*, ...

.claude/
  settings.json              # wires Claude events -> .caws/hooks/dispatch/<event>.sh
  settings.json.example      # canonical CAWS-only wiring reference
  hooks/
    CLAUDE.md                # agent doctrine for this surface
    README.md                # hook inventory
    doc-frontmatter-check.sh # repo-local advisory (not part of the CAWS pack)
  logs/                      # audit / strike state (gitignored)
```

Install / update the pack with:

```bash
caws init --agent-surface claude-code
# if a managed file has drifted and you want the upstream baseline:
caws init --agent-surface claude-code --overwrite --force
```

## Wiring

`.claude/settings.json` injects `CAWS_AGENT_SURFACE=claude-code` and routes
lifecycle events to `.caws/hooks/dispatch/`. Handlers self-filter inside the
shared dispatchers — do not re-wire individual guards in `settings.json`
unless you are adding a **repo-local** check (e.g. `doc-frontmatter-check.sh`).

Mid-session installs do not activate until the Claude Code session is restarted.

## Cursor

Cursor can load these same Claude Code hooks via third-party hook compatibility
(see `.cursor/README.md`). Official `caws init --agent-surface cursor` is not
implemented in CAWS 11.9.0 yet; the shared core already recognizes
`CAWS_AGENT_SURFACE=cursor`.

## Further reading

- `.claude/hooks/CLAUDE.md` — agent doctrine
- `.claude/hooks/README.md` — handler inventory
- `.caws/hooks/` — the shared core itself
