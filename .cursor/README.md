# Cursor + CAWS hooks (v11.9)

## Status

CAWS 11.9.0 recognizes `--agent-surface cursor` but **does not yet ship** a
Cursor hook pack (`caws init --agent-surface cursor` refuses with "declared
but not yet implemented"). The shared hook core under `.caws/hooks/` already
has a `cursor` surface arm (`CAWS_VENDOR_DIR=.cursor`).

## How Cursor gets CAWS governance today

Cursor can load Claude Code hooks from `.claude/settings.json` via **third-party
hooks** (see [Cursor docs: Third Party Hooks](https://cursor.com/docs/reference/third-party-hooks.md)).

1. Enable **Include third-party Plugins, Skills, and other configs** in
   Cursor Settings → Rules, Skills, Subagents.
2. Keep this repo's `.claude/settings.json` wired to
   `.caws/hooks/dispatch/<event>.sh` (already done for Claude Code).
3. Restart the Cursor agent session after hook-pack updates.

Cursor maps Claude events (`PreToolUse` → `preToolUse`, etc.) and tool names
(`Bash` → `Shell`, `Edit` → `Write`) automatically. Nested
`hookSpecificOutput` responses from the CAWS pack are accepted.

## Native `.cursor/hooks.json`

Do **not** add a parallel native Cursor wiring that calls the same
dispatchers while third-party Claude hooks are enabled — both would run and
double-enforce. When CAWS ships an official cursor pack, replace this note
with `caws init --agent-surface cursor`.

## Shared core location

All load-bearing guards live under `.caws/hooks/`. Vendor adapters
(`.claude/`, future `.cursor/`) only own wiring + surface docs.

## PATH requirement

Cursor's hook subprocess often has a lean `PATH` that omits nvm/`npm -g`.
`.claude/settings.json` prepends `$HOME/.nvm/current/bin`, `$(npm prefix -g)/bin`,
and Homebrew bins before invoking the shared dispatchers so `caws` stays
resolvable. If scope-guard still says the CLI is not on PATH, ensure a global
`caws` is installed (`npm i -g @paths.design/caws-cli@^11.9`) and that
`~/.nvm/current` points at your active Node, or put `caws` on a system PATH.
