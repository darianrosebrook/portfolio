<!--
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 11
# caws_min_major: 11
# lineage_refs: 1,4,6,8,11,12,13,16,17,19,20
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
-->

# CAWS Claude Code Hook Pack

This directory contains the v11 Claude Code hook pack — pre-tool-call
governance infrastructure that interposes between the agent and its Edit,
Write, and Bash tools. The kernel/store/shell trinity owns canonical state;
these hooks **project** that state into refusals at the agent's boundary,
where the kernel cannot reach (the kernel runs downstream of the tool
call).

## These are CAWS-managed files

These are CAWS-managed hook-pack files installed by
`caws init --agent-surface claude-code`. Do not hand-edit them during ordinary
work. If a hook blocks legitimate work, surface the exact block to the user and
continue only with explicit user authorization or a CAWS-managed update path. Do
not bypass, delete, or locally weaken guards. (Any internal CAWS provenance
metadata in a file's header is upstream maintainer context — it is not an
authority requirement for this repo.)

To update the pack, re-run `caws init --agent-surface claude-code` rather than
editing files here. A managed file's header is how `caws init` recognizes it as
safe to update; hand-editing turns it into an unmanaged file the installer will
then refuse to touch.

## What each hook does

| File | What it prevents / does |
|------|------------------------|
| `block-dangerous.sh` + `classify_command.py` | catastrophic git operations; tokenized-argv bypasses; danger latch |
| `worktree-guard.sh` | amend/stash/reset/force-push during active worktrees; cross-boundary file copies; **canonical-checkout mutating git commands (checkout/switch/branch -f/reset non-hard) blocked when worktrees active**; **agent-Bash `git sparse-checkout` (any subcommand) refused, pointing to `caws worktree repair-sparse <name>`**; **the path-restore family (`git restore <path>` / `git checkout -- <path>` / `git clean`) blocked when worktrees active, worded by the actual op — a path restore is NOT a branch switch** |
| `worktree-write-guard.sh` | base-branch writes when worktrees are active; baseline-clobber; **Read/Write/Edit refusal against `<linked-worktree>/.caws/specs/*` so canonical spec authority is not materialized as a divergent private copy inside a worktree, before the broad `.caws/*` allowlist can exit 0**; **`.caws/worktrees/<name>/<rest>` payload writes routed through `lib/worktree-claim-oracle.cjs` BEFORE the broad `.caws/*` allowlist — a foreign session's write into another worktree's payload hard-blocks instead of being allowlisted** |
| `bash-write-guard.sh` | **Bash mutation-target authority: self-filters to Bash, extracts targets for a narrow mutation-form set (redirection, `tee`, `sed -i`, `perl -pi`, `truncate`, `touch`, `rm`, `mv`, `cp`, `dd of=`, git path-restore), and routes each through the SAME `lib/worktree-claim-oracle.cjs` as Write/Edit — a Bash mutation of a foreign worktree's payload blocks at the same boundary as a foreign Write/Edit** |
| `lib/worktree-claim-oracle.cjs` | **the single worktree-ownership oracle (standalone node helper, NOT an inline `node -e` heredoc) shelled out to by worktree-write-guard (Write/Edit) and bash-write-guard (Bash) so both surfaces return the same owner-vs-session answer; lazy `js-yaml` so the foreign-payload block works without a resolvable `js-yaml`; fails closed. Shipped as `.cjs` so it loads as CommonJS even in a repo whose `package.json` declares `"type":"module"`** |
| `scope-guard.sh` | edits outside the active spec's `scope.in`; cross-spec union interference; unbound → no authority |
| `session-caws-status.sh` | inherited-dirty-state collision; foreign-claim soft-block; version-skew |
| `reset-strikes.sh` | human-authorized strike reset (escape hatch, not auto-resettable) |
| `reset-danger-latch.sh` | human-authorized danger latch reset |
| `guard-strikes.sh` | progressive enforcement (strike 1 warn → strike 3 block) |
| `audit.sh` | per-tool-call audit log |
| `session-log.sh` | per-turn narrative + structured transcripts |
| `caws_dispatch/*` | wires Claude Code's lifecycle to the registered handler list |
| `lib/*` | shared input parsing and handler runner |
| `god-object-check.sh` | advisory: flags a written/edited file whose SLOC exceeds `CAWS_GOD_OBJECT_LOC` (default 2000). Edit-time analogue of the `god_object` gate. Always exit 0. |
| `shortcut-language-check.sh` | progressive: flags TODO/FIXME/XXX/placeholder/"not implemented" stub language in NON-test source; escalates warn→ask→block via guard-strikes. Edit-time analogue of the `todo_detection` gate. |
| `duplicate-export-check.sh` | advisory: on Write of a new JS/TS file, flags an exported symbol whose exact name already exists in the enclosing package src tree (generic-name allowlist). Always exit 0. |
| `loc-delta-check.sh` | advisory: on Edit, flags an added-line delta over `CAWS_LOC_DELTA_WARN_THRESHOLD` (default 300) via the new_string/old_string payload diff. Always exit 0. |

The four `*-check.sh` hooks above are the **edit-time advisory quality plane**. They reimplement the load-bearing quality-gates detection *intent* in self-contained bash; they do NOT import, shell out to, or runtime-couple with `packages/quality-gates`, and they do NOT change `caws gates run`. `caws gates run` remains the governed policy-gate runner; these hooks are installed utilities the repo tunes via env (`CAWS_GOD_OBJECT_LOC`, `CAWS_LOC_DELTA_WARN_THRESHOLD`).

## Authoring a spec without getting trapped

A handful of CAWS conventions reject an authored spec in ways that are easy to
hit blind. Each has a concrete fix below. **Validate every authored spec with
`caws specs show <id>` (or `caws doctor`) before you commit it** — those surface
a schema rejection immediately, so you never commit a spec that will not load.

- **Tier 1 / tier 2 specs require at least one contract.** A bare
  `caws specs create <id> --mode feature --risk-tier 2` is rejected
  (`Tier 2 specs require at least one contract`). Author the contract in the same
  command — do not hand-edit the YAML afterward:

  ```bash
  caws specs create FEAT-001 --title "..." --mode feature --risk-tier 2 \
    --contract "core-api:behavior"
  ```

  `--contract` is repeatable and takes `"name:type[:path]"`, where `type` is one
  of `api | schema | contract-test | behavior`. If the slice is a low-blast-radius
  chore, use `--risk-tier 3` (or `--mode chore`) instead — those need no contract.

- **`non_functional.*` values are arrays of strings, not scalars.** The four
  admitted subkeys (`accessibility`, `performance`, `reliability`, `security`)
  each take a list:

  ```yaml
  non_functional:
    reliability:
      - 'the guard must fail closed on a spawn error'
  ```

  A scalar value is rejected with `spec.schema.violation: Expected array`.

- **Quote YAML scalars that start with a backtick or other special character.**
  A `given:` / `when:` / `then:` value beginning with a backtick (or `:` `#` `{`
  `[`) breaks the parse (`bad indentation of a mapping entry`). Quote it, or use a
  block scalar (`>-`) which takes the text verbatim.

- **Scope paths must match real file extensions.** A test file is usually
  `*.test.js` even when the code under test is TypeScript — list the path that
  actually exists on disk in `scope.in`, or the scope guard refuses edits to the
  real file. Widen scope later with `caws specs amend-scope <id> --add <path>`
  (governed; no hand-edit).

## v11 state-model awareness

The v11 pack reads CAWS state under both v10 and v11 shapes during the
transition window:

- **Specs**: `lifecycle_state` is read first; `status` is the v10 fallback.
  Terminal states (closed, archived, completed) are not enforced.
  `draft` does NOT participate in union-wide blocking unless it is the
  authoritative/bound spec.
- **Worktrees registry**: both v11 direct-key
  (`{"<name>": {...}}`) and v10 nested
  (`{"worktrees": {"<name>": {...}}}`) shapes are accepted.
- **Bound spec id**: both `entry.specId` (v10) and `entry.spec_id` (v11)
  are accepted.

## Version-skew warning

`session-caws-status.sh` emits a non-blocking WARNING when the global
`caws` binary's major version differs from the repo's `caws-cli` major
version. Hooks parse local state directly, but any CLI advice in
diagnostics may be invalid. Consider matching major versions:
`npm install -g @paths.design/caws-cli@^<repo-major>`.

## Activation

Claude Code reads `.claude/settings.json` at session start. Installing
the pack mid-session does NOT activate it until the session is restarted.
`caws init --agent-surface claude-code` wires `settings.json` for you
(see below), but the hooks still load only on the NEXT session start.
Do not continue substantive work after install without restarting first;
the hooks you just installed are not yet enforcing.

## settings.json wiring

`caws init --agent-surface claude-code` MERGES the four CAWS
`caws_dispatch` entrypoints into `.claude/settings.json`
non-destructively: it creates the file if absent, appends the entries to
an existing file while preserving your `permissions`, `env`, and any
existing hooks, is a no-op if already wired, and refuses to touch an
unparseable file. It also always writes a `.claude/settings.json.example`
for reference. The canonical wiring it installs is:

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Read|Write|Edit|Glob|Grep|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/caws_dispatch/pre_tool_use.sh",
            "timeout": 45
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|Bash|ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/caws_dispatch/post_tool_use.sh",
            "timeout": 60
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/caws_dispatch/session_start.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/caws_dispatch/stop.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/session-log.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

## Managed file headers

Every managed file in this pack carries a header like:

```
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: <N>
# caws_min_major: 11
# lineage_refs: <comma-separated entries>
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
```

The header is what `caws init` uses to distinguish managed files (safe to
update on re-install under a documented policy) from local user files
(refused without explicit `--adopt` or `--overwrite`).

Removing or editing the header turns the file into an unmanaged
snowflake. Re-running install will then refuse to touch it — by design.
