# CLAUDE.md

This project uses CAWS (Coding Agent Working Standard) for quality-assured AI-assisted development.

## Build & Test

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Type check (if TypeScript)
npm run typecheck

# Drift check + quality gates (replaces the removed `caws validate`)
caws doctor && caws gates run --spec <id>
```

## CAWS Workflow (v11)

This project is on **CAWS v11**. The v10 commands `caws validate`, `caws iterate`,
`caws evaluate`, `caws verify-acs`, `caws burnup`, and `caws sidecar *` were
removed or renamed — see `../caws/docs/migration-v10-to-v11.md` for the full
bucket map. Use the v11 surface below.

Before writing code, check the canonical spec for the current feature:

```bash
# Create a feature spec for isolated work. Use --mode (not the removed
# v10 --type). Seed scope, blast radius and acceptance at creation; a
# scaffold-only scope.in cannot be bound to a worktree. --contract is
# optional and repeatable.
caws specs create FEAT-001 --mode feature --title "description" \
  --scope-in path/to/file.ts --module "affected module" \
  --acceptance "given: ...; when: ...; then: ..."

# If you're in a CAWS worktree, the created spec records it: worktree: <name>

# Drift detection over .caws/ state (replaces `caws validate`/`caws diagnose`).
# Exit: 0 clean, 1 findings, 2 composition failure.
caws doctor

# Policy-driven quality gates for the bound spec (replaces `caws validate`)
caws gates run --spec FEAT-201

# Inspect a spec (loads + schema-checks it; use before committing an authored spec)
caws specs show FEAT-201

# Read-only dashboard: project, current context, claim, doctor findings
caws status
```

There is no v11 replacement for `caws iterate`, `caws evaluate`, or
`caws burnup`. Acceptance evidence has one writer: record each criterion with
`caws specs evidence <id> --ac A<n> --status pass --verify` (plus
`--commit-sha`, `--artifact-path` or `--test-nodeid`), and re-derive it with
`caws specs verify-acs <id>` before closing. Encode the assertions themselves
in the test suite.

### Provenance & history (replaces `caws sidecar`)

The v11 audit surface is the hash-chained `.caws/events.jsonl`. Read it directly
instead of the removed `caws sidecar` / `caws provenance` commands:

```bash
# Work history / merge-readiness review (was: caws sidecar provenance)
jq -r 'select(.event=="spec_closed" or .event=="spec_archived" or .event=="worktree_merged")
  | "\(.ts) \(.event) \(.spec_id // .data)"' .caws/events.jsonl

# Append a typed evidence event (test | gate | human_decision); AC evidence
# goes through `caws specs evidence`, not this command
caws evidence record --type gate --spec FEAT-201 --data '{...}'
```

### Working Spec

Canonical feature specs live at `.caws/specs/<ID>.yaml` (create with
`caws specs create <id> --mode <feature|refactor|fix|doc|chore> --title "description"`).
There is **no** `.caws/working-spec.yaml` singleton in v11 — every spec is
per-feature. Specs created by the current CLI carry no `risk_tier`; older specs
keep theirs. The active spec defines:

- **Mode**: The type of change (`feature`, `refactor`, `fix`, `doc`, `chore`) -- required
- **Worktree**: The owning CAWS worktree name for this spec (`worktree`) -- recommended for all isolated work
- **Blast radius**: Which modules are affected (`blast_radius.modules`) -- required
- **Operational rollback SLO**: Time target for rollback (e.g. `"30m"`) -- required
- **Scope**: Which files you can edit (`scope.in`) and which are off-limits (`scope.out`)
- **Change budget**: Max files and lines of code per change (see note below)
- **Acceptance criteria**: What "done" means -- IDs must match `^A\d+$` (e.g. `A1`, `A12`)

Always stay within scope boundaries and change budgets.

Recommended operating rule: one active feature spec, one active worktree. If a task has a worktree, record that ownership in the spec YAML with `worktree: <name>`.

### Scope and Worktree Binding

The scope guard enforces file edit boundaries based on your spec's `scope.in` and `scope.out` patterns. **How it enforces depends on whether your worktree is bound to a spec:**

- **Authoritative mode** (worktree bound to a spec): Only your spec's scope patterns are checked. Other agents' specs cannot block your edits. This is the correct state.
- **Union mode** (no binding): The guard checks ALL active specs. Any `scope.out` from any spec can block you, even unrelated ones. This is the common source of "why is spec X blocking me?" confusion.

**The mutual binding** requires both sides:
1. The worktree registry (`.caws/worktrees.json`) must have `specId` pointing to your spec
2. Your spec (`.caws/specs/<id>.yaml`) must have `worktree: <name>` pointing to your worktree

If either side is missing, the guard falls back to union mode.

**Quick commands:**
```bash
# Explain the scope decision for a path (path is required)
caws scope show <path>

# Evaluate many paths at once, grouped by remediation
caws scope plan

# Fix a broken binding (worktree name, not spec id)
caws worktree bind <name> --spec <spec-id>

# Inspect the agent registry — who is currently working what
caws agents list

# Surface ownership of the current worktree (read-only without --takeover)
caws claim
```

**Recovery checklist** (when the scope guard blocks you unexpectedly):
1. Run `caws scope show` — check if you're in authoritative or union mode
2. If union mode: bind your spec with `caws worktree bind <name> --spec <spec-id>`
3. If authoritative but still blocked: the file is genuinely outside your spec's scope. Update your spec's `scope.in` if the file should be in scope, or request a waiver
4. Do NOT modify another spec's `scope.out` to unblock yourself — that defeats the isolation

### Agent Claims & Multi-Agent Coordination

Each session gets registered as a lease file in `.caws/leases/<sessionId>.json`, written by the machine runtime's `agent-register.sh` handler at SessionStart and refreshed by its `agent-heartbeat.sh` handler at PreToolUse. Read leases with `caws agents list` / `caws agents show <id>`. Worktree session ownership is tracked in `.caws/worktrees.json:owner` as a session id.

Leases are an operational cache and never authority. Authority lives in `.caws/worktrees.json` (ownership) and `.caws/specs/<id>.yaml` (scope).

Ownership overrides are per-command, and the flag differs:

- `caws claim --takeover` — forcibly take ownership of a foreign-owned worktree
- `caws worktree bind <name> --steal --reason "<text>"` — `--reason` is mandatory and appends a `worktree_ownership_seized` audit event
- `caws worktree merge` has no ownership-override flag

The refusal prints a structured warning naming the claimer as `<sessionId>:<platform>`, the heartbeat age, and any matching session-log path so you can read context before deciding.

**Decision-gating uses session-id equality only.** `caws agents prune` is registry hygiene; it does NOT authorize takeover. A stale heartbeat doesn't mean the prior session is dead — it may be paused. Under Claude Code the recorded pid is an ephemeral per-invocation subshell, so recency, not PID liveness, is the signal.

`--takeover` writes a durable `prior_owners` audit on the worktree entry (sessionId, platform, lastSeen-at-takeover, takenOver_at) so handoffs are traceable in `worktrees.json`, not just in agent memory.

### Spec lifecycle: archive

`caws specs archive <id>` requires the spec be `closed` first. In v11 (verified
against caws 11.6.0), archive is a **move-shaped** operation: it relocates the
spec YAML from `.caws/specs/<id>.yaml` to `.caws/specs/.archive/<id>.yaml` and
appends a `spec_archived` event to the hash-chained `.caws/events.jsonl`
recording the `from_path`/`to_path` of the move. The `.caws/specs/.archive/`
directory is real and tracked; `caws specs list` reports anything under it as
`status: archived`.

Recover an archived body with `caws specs show <id> --archived` or
`caws specs recover <id>` — recover reads the `spec_archived` event and the
`.caws/specs/.archive/<id>.yaml` body for move-shaped archives, falling back to
git-history/`blob_sha` recovery for older tombstone-shaped archives. The archive
operation makes its own audit commit, so run it from a clean working tree —
it refuses to auto-commit over uncommitted changes.

For a never-activated draft, use `caws specs retire-draft <id>` (which deletes
the draft) rather than archive. Never use `mv`/`git rm` to relocate or remove specs —
that bypasses the comment-preserving patch, the `updated_at` bump, and the
hash-chained audit record.

> **Budget note**: `change_budget:` in a spec is informational documentation only. The
> risk-tier budgets in `policy.yaml` are an advisory sizing goal: `budget_limit` reports
> an overage and never blocks, and no waiver raises a budget.

### Quality Gates

`caws gates run --spec <id>` evaluates exactly five gates. They are declared in
`.caws/policy.yaml` and are the complete set the CLI knows about — its internal
`KNOWN_GATE_IDS` tuple contains only these, so a gate absent from the list cannot
be enabled by configuration:

| Gate | Mode | What it enforces |
|------|------|------------------|
| `budget_limit` | warn (advisory) | reports `max_files` / `max_loc` against the risk-tier sizing goal; never blocks |
| `spec_completeness` | block | required spec fields are present |
| `scope_boundary` | block | edits stay within `scope.in`, never `scope.out` |
| `god_object` | warn | source files over 1750 / 2000 lines |
| `todo_detection` | warn | `TODO` / `FIXME` / `HACK` / `XXX` markers |

Only the sizing goal varies by tier (`caws gates list` prints the live values):

| Risk tier | max_files | max_loc |
|-----------|-----------|---------|
| 1 (critical) | 25 | 1000 |
| 2 (standard) | 50 | 2000 |
| 3 (low risk) | 100 | 5000 |

**Coverage and mutation score are not gate-enforced.** The CLI ships no evaluator
for either, so `Overall: OK` from `caws gates run` says nothing about them. Treat
these as targets you verify yourself, not gates that will stop you:

- **Coverage** — measure with `npm run test:coverage`. No thresholds are configured
  in `vitest.config.mjs`, so the command reports and never fails. Repo-wide coverage
  was **19.91% statements / 74.22% branch** when last measured (2026-08-05); judge a
  change on the coverage of the files it touches, not the aggregate, which is
  dominated by large untested utility trees.
- **Mutation score** — no runner is installed (no Stryker). Not measurable today.
  Kill mutants by hand when hardening safety-critical logic, and say so explicitly
  rather than implying a score.

Contracts are optional: `caws specs create --contract "name:type[:path]"` records
one (type `api|schema|contract-test|behavior`), and nothing checks contracts
afterwards. Manual review is a team convention, not a gate.

### Key Rules

1. **Stay in scope** -- only edit files listed in `scope.in`, never touch `scope.out`
2. **Size changes to the budget** -- treat `max_files` and `max_loc` as the sizing goal; split work that overshoots rather than relying on the advisory gate
3. **No shadow files** -- edit in place, never create `*-enhanced.*`, `*-new.*`, `*-v2.*`, `*-final.*` copies
4. **Tests first** -- write failing tests before implementation
5. **Deterministic code** -- inject time, random, and UUID generators for testability
6. **No fake implementations** -- no placeholder stubs, no `TODO` in committed code, no in-memory arrays pretending to be persistence, no hardcoded mock responses
7. **Prove claims** -- never assert "production-ready", "complete", or "battle-tested" without passing all quality gates. Provide evidence, not assertions.
8. **No marketing language in docs** -- avoid "revolutionary", "cutting-edge", "state-of-the-art", "enterprise-grade"
9. **Ask first for risky changes** -- changes touching >10 files, >300 LOC, crossing package boundaries, or affecting security/infrastructure require discussion first
10. **Conventional commits** -- use `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` prefixes

### Waivers

If you need to bypass a quality gate, create a waiver with justification.
Note the v11 command is singular `caws waiver` (v10's plural `caws waivers`
was renamed). A waiver only suppresses matching violations in `caws gates run`;
it never lifts a hook guard (hook blocks take a human-granted `caws reprieve`):

```bash
caws waiver create WV-001 --title "why this gate is waived" --gate scope_boundary \
  --reason "justification" --approved-by "@approver" \
  --expires-at 2026-12-31T00:00:00Z --spec FEAT-201
```

Add `--dry-run` to validate the waiver without writing `.caws/waivers/`.

## Project Structure

```
.caws/
  specs/              # Canonical feature specs (one YAML per feature; no singleton)
  policy.yaml         # Quality policy + tiers + gates
  waivers/            # Active waivers (one file per waiver)
  hooks/              # Retired v11.9 project hook copies (not executed; see Hooks)
  events.jsonl        # Hash-chained audit log (gitignored; local-runtime)
  state/              # Runtime working state (auto-managed; gitignored)
  worktrees.json      # Worktree registry -- ownership authority (gitignored)
  leases/             # Agent liveness, one file per session (gitignored)
  agents.json         # Legacy v10 agent registry; keep as `{}` (gitignored)
```

> **Working state**: `.caws/state/<spec-id>.json` tracks runtime progress -- current phase,
> validation/evaluation results, gate history, and files touched. This is maintained
> automatically by CAWS commands. Agents don't need to manage it directly.

## Hooks

CAWS guards run from the **machine runtime** in `~/.caws`, not from this repo.
The user-level `~/.claude/settings.json` registers
`python3 ~/.caws/bin/caws-hook claude-code <event> --system` for every
lifecycle event; the runtime selects the stock handlers from the active
snapshot (`~/.caws/state/adapter-runtime.json`) and applies this project's
surface policy from `~/.caws/state/projects/<canonical-path-hash>.json`
(empty: no disabled stock handlers, no local extensions).

- **PreToolUse** → danger latch, worktree/scope/write guards, protected paths, secrets scan, …
- **PostToolUse** → naming / god-object / todo / loc-delta checks, audit, transcripts
- **SessionStart / Stop / PreCompact / SessionEnd** → status, agent lease, goal/AC gate, transcripts

`.claude/settings.json` holds only the repo-local `doc-frontmatter-check.sh`
PostToolUse hook and permissions. The files under `.caws/hooks/` are the
pre-migration project copies; no harness executes them.

Update every adopted project at once with `caws init adapters install` (it
installs a new verified snapshot). `caws doctor` reports runtime integrity.
Hook guards are lifted only by a human-granted `caws reprieve grant`. See
`../caws/docs/guides/hook-packs.md` for the machine adapter model and
`.claude/README.md` for what remains repo-local.
