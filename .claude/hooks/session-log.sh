#!/bin/bash
# Session Logger for Claude Code → ChatGPT Context Transfer
#
# On Stop/PreCompact: reads the full transcript from ~/.claude/ and generates:
#   session.txt        — lightweight index (header + turn list + exploration + audit)
#   turn-001.txt       — per-turn narrative (user message + reasoning + key tool output)
#   turn-001.json      — per-turn structured data (reasoning + tools + edits + results)
#
# Output: ./tmp/<session-id>/
#
# Wired into: SessionStart (metadata), Stop (generate), PreCompact (safety net)

set -euo pipefail

INPUT=$(cat)

# --- Parse common fields ---
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# --- Log directory ---
LOG_DIR="${CWD}/tmp/${SESSION_ID}"
mkdir -p "$LOG_DIR"

SESSION_MD="$LOG_DIR/session.txt"
META_FILE="$LOG_DIR/.meta.json"

# ============================================================
# Helper: resolve transcript path
# ============================================================
resolve_transcript() {
  if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    echo "$TRANSCRIPT_PATH"
    return
  fi
  local slug
  slug=$(echo "$CWD" | sed 's|/|-|g; s|^-||')
  local candidate="$HOME/.claude/projects/${slug}/${SESSION_ID}.jsonl"
  if [ -f "$candidate" ]; then
    echo "$candidate"
    return
  fi
  candidate="$HOME/.claude/projects/-${slug}/${SESSION_ID}.jsonl"
  if [ -f "$candidate" ]; then
    echo "$candidate"
    return
  fi
  echo ""
}

# ============================================================
# Helper: make path relative to project
# ============================================================
rel_path() {
  echo "$1" | sed "s|${CWD}/||"
}

# ============================================================
# Generate per-turn files + session.md index from transcript
# ============================================================
generate_session_output() {
  local transcript="$1"
  local branch head_sha dirty_count
  branch=$(cd "$CWD" 2>/dev/null && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  head_sha=$(cd "$CWD" 2>/dev/null && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  dirty_count=$(cd "$CWD" 2>/dev/null && git status --porcelain 2>/dev/null | wc -l | tr -d ' ' || echo "0")

  # --- Read metadata if available ---
  local started_at model start_sha
  if [ -f "$META_FILE" ]; then
    started_at=$(jq -r '.local_time // "unknown"' "$META_FILE")
    model=$(jq -r '.model // "unknown"' "$META_FILE")
    start_sha=$(jq -r '.head_sha // ""' "$META_FILE")
  else
    started_at="(resumed session)"
    model="unknown"
    start_sha=""
  fi

  if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
    cat > "$SESSION_MD" << MDEOF
# Session Log: $(basename "$CWD")

| Field | Value |
|-------|-------|
| Session ID | \`${SESSION_ID}\` |
| Started | ${started_at} |
| Model | ${model} |
| Branch | \`${branch}\` @ \`${head_sha}\` |

---

_No transcript found. Narrative extraction unavailable._
MDEOF
    return
  fi

  # --- Generate per-turn files via python ---
  # jq emits each content block as a separate chronological event.
  # Python accumulates into turns and writes sequential timeline per turn.
  jq -c '
    if .type == "user" then
      if (.message.content | type) == "string" then
        {ev: "user_text", text: .message.content}
      elif (.message.content | type) == "array" then
        .message.content[]? |
        if .type == "tool_result" then
          {ev: "tool_result", id: .tool_use_id, content: ((.content // "") | tostring), is_error: (.is_error // false)}
        else
          empty
        end
      else
        empty
      end
    elif .type == "assistant" then
      .message.content[]? |
      if .type == "text" then
        {ev: "text", text: .text}
      elif .type == "tool_use" then
        {ev: "tool_use", name, id,
         file: (.input.file_path // null),
         command: (.input.command // null),
         description: (.input.description // null),
         pattern: (.input.pattern // null),
         prompt: (.input.prompt // null),
         subagent_type: (.input.subagent_type // null)}
      else
        empty
      end
    else
      empty
    end
  ' "$transcript" 2>/dev/null > "$LOG_DIR/.events.jsonl"

  # Write python script to temp file (can't pipe + heredoc simultaneously)
  local pyscript
  pyscript=$(mktemp "${TMPDIR:-/tmp}/session-log-XXXX.py")
  trap "rm -f '$pyscript'" RETURN
  cat > "$pyscript" << 'PYEOF'
import json, sys, os

log_dir = sys.argv[1]
cwd = sys.argv[2]
session_id = sys.argv[3]
started_at = sys.argv[4]
model = sys.argv[5]
branch = sys.argv[6]
head_sha = sys.argv[7]
dirty_count = sys.argv[8]
start_sha = sys.argv[9]

def rel(path):
    if path and path.startswith(cwd + "/"):
        return path[len(cwd) + 1:]
    return path or ""

def decode_structured_text_payload(raw):
    """Decode JSON-escaped text payloads (e.g., Agent/Task tool outputs)."""
    if not isinstance(raw, str):
        return raw
    payload = raw.strip()
    if not payload or payload[0] not in "[{":
        return raw
    try:
        parsed = json.loads(payload)
    except Exception:
        return raw

    text_blocks = []
    if isinstance(parsed, dict):
        parsed = [parsed]
    if isinstance(parsed, list):
        for item in parsed:
            if not isinstance(item, dict):
                continue
            text = item.get("text")
            if isinstance(text, str) and text.strip():
                text_blocks.append(text)

    if text_blocks:
        return "\n\n".join(text_blocks)
    return raw

# ---- Accumulate turns as chronological event timelines ----
turns = []
# Each turn: {user, timeline: [{kind, ...}, ...], edits, reads, searches, commands}
current = {"user": None, "timeline": [], "edits": [], "reads": [], "searches": [], "commands": []}

def new_turn(user_text):
    return {
        "user": user_text if user_text else None,
        "timeline": [], "edits": [], "reads": [], "searches": [], "commands": [],
    }

# Track pending tool_use IDs to match with results
pending_tools = {}  # id -> {name, ...}

NOISE_PREFIXES = ("<local-command", "<command-name", "<local-command-stdout",
                  "<local-command-caveat", "This session is being continued")

# Keywords that make a tool result "notable" (worth showing inline)
NOTABLE_KW = ["error", "fail", "refusal", "mismatch", "passed", "assert",
              "traceback", "exception", "pytest", "PASSED", "FAILED", "TypedRefusal"]

for line in sys.stdin:
    try:
        entry = json.loads(line)
    except json.JSONDecodeError:
        continue

    ev = entry.get("ev")

    if ev == "user_text":
        text = entry["text"]
        if any(text.startswith(p) for p in NOISE_PREFIXES):
            continue
        if not text.strip():
            continue
        if current["user"] or current["timeline"]:
            turns.append(current)
        current = new_turn(text)

    elif ev == "text":
        text = entry.get("text", "")
        if len(text) > 20:
            current["timeline"].append({"kind": "reasoning", "text": text})

    elif ev == "tool_use":
        name = entry.get("name", "")
        tid = entry.get("id", "")
        tool_entry = {"kind": "tool_call", "name": name, "id": tid}

        if name in ("Write", "Edit"):
            f = rel(entry.get("file"))
            tool_entry["file"] = f
            if f and f not in current["edits"]:
                current["edits"].append(f)
        elif name == "Read":
            f = rel(entry.get("file"))
            tool_entry["file"] = f
            if f and f not in current["reads"]:
                current["reads"].append(f)
        elif name in ("Grep", "Glob"):
            pat = entry.get("pattern", "")
            tool_entry["pattern"] = pat
            if pat:
                current["searches"].append(pat)
        elif name == "Bash":
            cmd = entry.get("command", "")
            desc = entry.get("description", "")
            tool_entry["command"] = cmd
            tool_entry["description"] = desc or ""
            if cmd:
                current["commands"].append({"cmd": cmd, "desc": desc or ""})
        elif name == "Task":
            tool_entry["prompt"] = entry.get("prompt", "")
            tool_entry["subagent_type"] = entry.get("subagent_type", "")

        current["timeline"].append(tool_entry)
        pending_tools[tid] = tool_entry

    elif ev == "tool_result":
        tid = entry.get("id", "")
        content = entry.get("content", "")
        is_error = entry.get("is_error", False)
        tool_info = pending_tools.get(tid, {})
        name = tool_info.get("name", "unknown")

        # Always capture tool results for Bash, Task, Agent.
        # For Read/Write/Edit, only capture if notable (errors, test output, etc.)
        # to avoid dumping entire file contents into turn logs.
        always_capture = name in ("Bash", "Task", "Agent")
        notable = is_error
        if not notable and content:
            content_lower = content.lower()
            notable = any(kw.lower() in content_lower for kw in NOTABLE_KW)

        if (always_capture or notable) and content:
            # Cap file-content tools (full file reads/writes blow out turn files)
            display = content
            if name in ("Read", "Write", "Edit") and len(content) > 2000:
                display = content[:2000] + "\n...(file content truncated)"
            elif name in ("Task", "Agent"):
                display = decode_structured_text_payload(content)
            elif name == "Bash" and len(content) > 5000:
                display = content[:5000] + "\n...(output truncated at 5000 chars)"
            # Graft result onto the original tool_call entry (not a separate timeline item)
            if tool_info:
                tool_info["output"] = display
                tool_info["is_error"] = is_error
            else:
                # Orphan result (no matching call) — append standalone
                current["timeline"].append({
                    "kind": "tool_output",
                    "name": name,
                    "content": display,
                    "is_error": is_error,
                })

if current["user"] or current["timeline"]:
    turns.append(current)

# ---- Write per-turn files ----
turn_index = []

for i, turn in enumerate(turns):
    num = i + 1
    padded = f"{num:03d}"

    # --- Build per-turn markdown: chronological timeline ---
    md_lines = [f"# Turn {num}", ""]

    if turn["user"]:
        md_lines.extend([f"> ---user---\n{turn['user']}\n---\/user---", ""])

    for event in turn["timeline"]:
        kind = event["kind"]

        if kind == "reasoning":
            text = event["text"]
            md_lines.append(text)
            md_lines.extend(["", "---", ""])

        elif kind == "tool_call":
            name = event.get("name", "")
            if name in ("Read", "Glob"):
                f = event.get("file") or event.get("pattern", "")
                md_lines.append(f"`{name}` {f}")
            elif name in ("Write", "Edit"):
                md_lines.append(f"`{name}` {event.get('file', '')}")
            elif name == "Bash":
                cmd = event.get("command", "")
                desc = event.get("description", "")
                header = f"`Bash` _{desc}_" if desc else "`Bash`"
                if len(cmd) > 120:
                    md_lines.extend([header, "```", cmd, "```"])
                else:
                    md_lines.append(f"{header} `{cmd}`" if cmd else header)
            elif name in ("Grep",):
                md_lines.append(f"`Grep` {event.get('pattern', '')}")
            elif name == "Task":
                sa = event.get("subagent_type", "subagent")
                prompt = event.get("prompt", "")
                header = f"`Task` ({sa})" if sa else "`Task` (subagent)"
                if prompt:
                    # Show the dispatch prompt so readers know what the subagent was asked
                    short_prompt = prompt[:500]
                    if len(prompt) > 500:
                        short_prompt += "..."
                    md_lines.extend([header, "", f"> {short_prompt}", ""])
            else:
                md_lines.append(f"`{name}`")
            md_lines.append("")

            # If tool result was grafted onto this call, render it inline
            if "output" in event:
                output = event["output"]
                is_error = event.get("is_error", False)
                label = "error" if is_error else "output"
                md_lines.extend([
                    f"**{name}** ({label}):",
                    "```",
                    output,
                    "```",
                    "",
                ])

        elif kind == "tool_output":
            # Orphan result (no matching call found) — render standalone
            content = event.get("content", "")
            name = event.get("name", "")
            is_error = event.get("is_error", False)
            label = "error" if is_error else "output"
            md_lines.extend([
                f"**{name}** ({label}):",
                "```",
                content,
                "```",
                "",
            ])

    # Write turn markdown
    with open(os.path.join(log_dir, f"turn-{padded}.txt"), "w") as f:
        f.write("\n".join(md_lines))

    # --- Build per-turn JSON: chronological timeline ---
    tool_summary = {}
    for event in turn["timeline"]:
        if event["kind"] == "tool_call":
            n = event.get("name", "")
            tool_summary[n] = tool_summary.get(n, 0) + 1

    def group_by_ext(paths):
        groups = {}
        for p in paths:
            ext = os.path.splitext(p)[1] or "(no ext)"
            groups.setdefault(ext, []).append(p)
        return groups

    turn_json = {
        "turn": num,
        "user": turn["user"],
        "timeline": turn["timeline"],
        "tool_summary": tool_summary,
        "files_edited": group_by_ext(turn["edits"]),
        "files_read": group_by_ext(turn["reads"]),
        "searches": turn["searches"],
        "commands": [c["cmd"] for c in turn["commands"]],
    }

    with open(os.path.join(log_dir, f"turn-{padded}.json"), "w") as f:
        json.dump(turn_json, f, indent=2)

    # Index entry
    user_preview = (turn["user"] or "(no user message)")[:120]
    reasoning_count = sum(1 for e in turn["timeline"] if e["kind"] == "reasoning")
    tool_count = sum(1 for e in turn["timeline"] if e["kind"] == "tool_call")
    turn_index.append({
        "num": num,
        "padded": padded,
        "user_preview": user_preview,
        "reasoning_count": reasoning_count,
        "tool_count": tool_count,
        "edits": turn["edits"],
    })

# ---- Write session.md index ----
with open(os.path.join(log_dir, "session.txt"), "w") as f:
    f.write(f"# Session Log: {os.path.basename(cwd)}\n\n")
    f.write("| Field | Value |\n")
    f.write("|-------|-------|\n")
    f.write(f"| Session ID | `{session_id}` |\n")
    f.write(f"| Started | {started_at} |\n")
    f.write(f"| Model | {model} |\n")
    f.write(f"| Branch | `{branch}` @ `{head_sha}` |\n")
    f.write(f"| Turns | {len(turn_index)} |\n")
    f.write("\n---\n\n")

    f.write("## Turns\n\n")
    for t in turn_index:
        edits_str = ", ".join(f"`{e}`" for e in t["edits"][:3])
        if len(t["edits"]) > 3:
            edits_str += f" +{len(t['edits'])-3} more"
        summary = f"{t['reasoning_count']} msgs, {t['tool_count']} tools"
        if edits_str:
            summary += f" | {edits_str}"
        f.write(f"- **[Turn {t['num']}](turn-{t['padded']}.md)** — {t['user_preview']}\n")
        f.write(f"  _{summary}_\n")

    f.write("\n---\n\n")

    # Exploration summary (deduplicated across all turns)
    all_reads = []
    all_searches = []
    all_edits = []
    all_commands = []
    for turn in turns:
        all_reads.extend(turn["reads"])
        all_searches.extend(turn["searches"])
        all_edits.extend(turn["edits"])
        all_commands.extend(turn["commands"])

    f.write("## Exploration\n")
    f.write("_Files read and searches performed (deduplicated)._\n\n")
    for r in sorted(set(all_reads)):
        f.write(f"- READ `{r}`\n")
    for s in sorted(set(all_searches)):
        f.write(f"- SEARCH `{s}`\n")
    f.write("\n")

    f.write("## Audit\n")
    f.write("_Edits, commands, git activity._\n\n")
    for e in sorted(set(all_edits)):
        f.write(f"- EDIT `{e}`\n")
    for cmd in all_commands:
        short = cmd["cmd"][:120]
        # Only log meaningful commands
        meaningful = any(kw in short for kw in [
            "pytest", "cargo test", "ruff", "mypy", "npm test",
            "git log", "git diff", "git status", "git add", "git commit",
            "git merge", "caws ", "pip install", "make", "cargo build"
        ])
        if meaningful:
            if cmd["desc"]:
                f.write(f"- BASH `{short}` — {cmd['desc']}\n")
            else:
                f.write(f"- BASH `{short}`\n")
    f.write("\n")

    f.write("## Session Snapshot\n\n")
    f.write("| Field | Value |\n")
    f.write("|-------|-------|\n")
    f.write(f"| Branch | `{branch}` @ `{head_sha}` |\n")
    f.write(f"| Dirty files | {dirty_count} |\n")
    f.write(f"| Total turns | {len(turn_index)} |\n")

PYEOF

  # Run the python script with events as input
  python3 "$pyscript" "$LOG_DIR" "$CWD" "$SESSION_ID" "$started_at" "$model" "$branch" "$head_sha" "$dirty_count" "$start_sha" < "$LOG_DIR/.events.jsonl"
  rm -f "$LOG_DIR/.events.jsonl"
}

# ============================================================
# EVENT: SessionStart — save metadata
# ============================================================
handle_session_start() {
  local model source branch head_sha dirty_count full_time
  model=$(echo "$INPUT" | jq -r '.model // "unknown"')
  source=$(echo "$INPUT" | jq -r '.source // "unknown"')
  branch=$(cd "$CWD" 2>/dev/null && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  head_sha=$(cd "$CWD" 2>/dev/null && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  dirty_count=$(cd "$CWD" 2>/dev/null && git status --porcelain 2>/dev/null | wc -l | tr -d ' ' || echo "0")
  full_time=$(date +"%Y-%m-%d %H:%M:%S %Z")

  jq -cn \
    --arg sid "$SESSION_ID" \
    --arg ts "$TIMESTAMP" \
    --arg lt "$full_time" \
    --arg model "$model" \
    --arg source "$source" \
    --arg branch "$branch" \
    --arg head "$head_sha" \
    --arg dirty "$dirty_count" \
    --arg project "$(basename "$CWD")" \
    --arg transcript "$TRANSCRIPT_PATH" \
    '{session_id: $sid, started_at: $ts, local_time: $lt, model: $model, source: $source, branch: $branch, head_sha: $head, dirty_files: $dirty, project: $project, transcript_path: $transcript}' \
    > "$META_FILE"

  # Generate initial output (may be empty if transcript not ready)
  generate_session_output "$(resolve_transcript)"
}

# ============================================================
# EVENT: Stop — regenerate from transcript
# ============================================================
handle_stop() {
  generate_session_output "$(resolve_transcript)"
}

# ============================================================
# EVENT: PreCompact — safety net before context eviction
# ============================================================
handle_pre_compact() {
  generate_session_output "$(resolve_transcript)"
}

# ============================================================
# Agent registry heartbeat — register this agent with CAWS
# ============================================================
AGENTS_REGISTRY="${CWD}/.caws/agents.json"

heartbeat_agent() {
  [ "$SESSION_ID" = "unknown" ] && return
  [ ! -d "${CWD}/.caws" ] && return

  local model_val
  model_val=$(echo "$INPUT" | jq -r '.model // "unknown"' 2>/dev/null)

  local registry
  if [ -f "$AGENTS_REGISTRY" ]; then
    registry=$(cat "$AGENTS_REGISTRY" 2>/dev/null || echo '{"version":1,"agents":{}}')
  else
    registry='{"version":1,"agents":{}}'
  fi

  registry=$(echo "$registry" | python3 -c "
import json, sys
from datetime import datetime, timedelta, timezone

TTL = timedelta(minutes=30)
now = datetime.now(timezone.utc)
sid = '$SESSION_ID'
model = '$model_val'

data = json.load(sys.stdin)
agents = data.get('agents', {})

pruned = {}
for k, entry in agents.items():
    try:
        last = datetime.fromisoformat(entry['lastSeen'].replace('Z', '+00:00'))
        if now - last < TTL:
            pruned[k] = entry
    except (KeyError, ValueError):
        pass

existing = pruned.get(sid, {})
pruned[sid] = {
    'sessionId': sid,
    'platform': 'claude-code',
    'model': model if model != 'unknown' else existing.get('model'),
    'specId': existing.get('specId'),
    'ttl': 1800000,
    'firstSeen': existing.get('firstSeen', now.strftime('%Y-%m-%dT%H:%M:%SZ')),
    'lastSeen': now.strftime('%Y-%m-%dT%H:%M:%SZ'),
}

data['agents'] = pruned
json.dump(data, sys.stdout, indent=2)
" 2>/dev/null)

  [ -n "$registry" ] && echo "$registry" > "$AGENTS_REGISTRY"
}

remove_agent() {
  [ "$SESSION_ID" = "unknown" ] && return
  [ ! -f "$AGENTS_REGISTRY" ] && return

  python3 -c "
import json
sid = '$SESSION_ID'
with open('$AGENTS_REGISTRY', 'r') as f:
    data = json.load(f)
data.get('agents', {}).pop(sid, None)
with open('$AGENTS_REGISTRY', 'w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null || true
}

# ============================================================
# DISPATCH
# ============================================================
case "$HOOK_EVENT" in
  SessionStart)   handle_session_start; heartbeat_agent ;;
  Stop)           handle_stop; remove_agent ;;
  PreCompact)     handle_pre_compact; heartbeat_agent ;;
  *)              ;; # Other events: no-op
esac

exit 0
