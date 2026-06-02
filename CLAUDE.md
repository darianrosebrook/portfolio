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
# v10 --type). Tier 1/2 require at least one --contract; tier 3 / --mode
# chore do not.
caws specs create FEAT-001 --mode feature --risk-tier 2 \
  --title "description" --contract "core-api:behavior"

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

There is no v11 replacement for `caws iterate`, `caws evaluate`,
`caws verify-acs`, or `caws burnup`. Use the spec's acceptance criteria as
guidance, `caws gates run` for policy gates, and encode AC-evidence assertions
in the test suite directly.

### Provenance & history (replaces `caws sidecar`)

The v11 audit surface is the hash-chained `.caws/events.jsonl`. Read it directly
instead of the removed `caws sidecar` / `caws provenance` commands:

```bash
# Work history / merge-readiness review (was: caws sidecar provenance)
jq -r 'select(.event=="spec_closed" or .event=="spec_archived" or .event=="worktree_merged")
  | "\(.ts) \(.event) \(.spec_id // .data)"' .caws/events.jsonl

# Record typed evidence (test | gate | ac)
caws evidence record --type gate --spec FEAT-201 --data '{...}'
```

### Working Spec

Canonical feature specs live at `.caws/specs/<ID>.yaml` (create with
`caws specs create <id> --mode <feature|refactor|fix|doc|chore> --risk-tier <1|2|3> --title "description"`).
There is **no** `.caws/working-spec.yaml` singleton in v11 — every spec is
per-feature. The active spec defines:

- **Risk tier**: Quality requirements (T1: critical, T2: standard, T3: low risk)
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
# See your effective scope and binding health
caws scope show

# Fix a broken binding
caws worktree bind <spec-id>

# Inspect the agent registry — who is currently working what
caws agents list

# Inspect a specific worktree's claim (read-only by default)
caws worktree claim <name>
```

**Recovery checklist** (when the scope guard blocks you unexpectedly):
1. Run `caws scope show` — check if you're in authoritative or union mode
2. If union mode: bind your spec with `caws worktree bind <spec-id>`
3. If authoritative but still blocked: the file is genuinely outside your spec's scope. Update your spec's `scope.in` if the file should be in scope, or request a waiver
4. Do NOT modify another spec's `scope.out` to unblock yourself — that defeats the isolation

### Agent Claims & Multi-Agent Coordination

Each session gets registered in `.caws/agents.json` automatically (via the session-log hook and on every CAWS lifecycle CLI invocation). Worktree session ownership is tracked in `.caws/worktrees.json:owner` as a session id.

`caws worktree bind`, `merge`, and `claim` will refuse to mutate a worktree owned by a different session id without explicit `--takeover`. The refusal prints a structured warning naming the claimer as `<sessionId>:<platform>`, the heartbeat age, and any matching `tmp/<sessionId>/` session-log path so you can read context before deciding.

**Decision-gating uses session-id equality only.** TTL pruning of `agents.json` is registry hygiene; it does NOT authorize takeover. A stale heartbeat doesn't mean the prior session is dead — it may be paused.

`--takeover` writes a durable `prior_owners` audit on the worktree entry (sessionId, platform, lastSeen-at-takeover, takenOver_at) so handoffs are traceable in `worktrees.json`, not just in agent memory.

### Spec lifecycle: archive (v11 tombstone)

`caws specs archive <id>` requires the spec be `closed` first. In v11, archive is a
**tombstone, not a directory move**: it *deletes* the spec YAML from `.caws/specs/`
and appends a recoverable `spec_archived` event to the hash-chained
`.caws/events.jsonl` carrying the body's `blob_sha`. There is **no**
`.caws/specs/.archive/` directory in v11 (that was the v10 behavior).

Recover an archived body with `caws specs show <id> --archived` or
`caws specs recover <id>` (resolves via `git show <blob_sha>`). The archive
operation makes its own audit commit, so run it from a clean working tree —
it refuses to auto-commit over uncommitted changes.

For a never-activated draft, use `caws specs retire-draft <id>` (same tombstone
shape) rather than archive. Never use `mv`/`git rm` to relocate or remove specs —
that bypasses the comment-preserving patch, the `updated_at` bump, and the
hash-chained audit record.

> **Budget note**: `change_budget:` in a spec is informational documentation only. CAWS
> derives the enforced budget from `policy.yaml` keyed on `risk_tier`. The field in the
> spec is not used by `caws gates run` for enforcement.

### Quality Gates

Quality requirements are tiered:

| Gate | T1 (Critical) | T2 (Standard) | T3 (Low Risk) |
|------|---------------|----------------|----------------|
| Test coverage | 90%+ | 80%+ | 70%+ |
| Mutation score | 70%+ | 50%+ | 30%+ |
| Contracts | Required | Required | Optional |
| Manual review | Required | Optional | Optional |

### Key Rules

1. **Stay in scope** -- only edit files listed in `scope.in`, never touch `scope.out`
2. **Respect change budgets** -- stay within `max_files` and `max_loc` limits
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
was renamed):

```bash
caws waiver create --reason emergency_hotfix --gates coverage_threshold
```

Valid reasons: `emergency_hotfix`, `legacy_integration`, `experimental_feature`, `performance_critical`, `infrastructure_limitation`

## Project Structure

```
.caws/
  specs/              # Canonical feature specs (one YAML per feature; no singleton)
  policy.yaml         # Quality policy + tiers + gates
  waivers/            # Active waivers (one file per waiver)
  events.jsonl        # Hash-chained audit log (gitignored; local-runtime)
  state/              # Runtime working state (auto-managed; gitignored)
  worktrees.json      # Worktree registry (gitignored; local-runtime)
```

> **Working state**: `.caws/state/<spec-id>.json` tracks runtime progress -- current phase,
> validation/evaluation results, gate history, and files touched. This is maintained
> automatically by CAWS commands. Agents don't need to manage it directly.

## Hooks

This project has Claude Code hooks configured in `.claude/settings.json`:

- **PreToolUse**: Blocks dangerous commands, scans for secrets, enforces scope
- **PostToolUse**: Runs quality checks, validates spec, checks naming conventions
- **Session**: Audit logging for provenance tracking

See `.claude/README.md` for hook details.
