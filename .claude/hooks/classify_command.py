#!/usr/bin/env python3
"""
Command safety classifier for Claude Code PreToolUse hooks.

Segments shell commands, parses them individually, and classifies each
as allow / confirm / deny based on tiered policy.

Output: JSON object with keys:
  decision: "allow" | "ask" | "deny"
  reason:   human-readable explanation (empty string for allow)

Usage:
  echo "$COMMAND" | python3 classify_command.py [--repo-root DIR] [--home DIR]
"""

from __future__ import annotations

import json
import os
import re
import shlex
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Paths that are safe targets for recursive deletion (relative to repo root).
# After normalization, if the resolved path starts with one of these, allow.
SAFE_DELETE_PREFIXES: list[str] = [
    "target/",
    "tmp/",
    ".pytest_cache/",
    "node_modules/",
    "__pycache__/",
]

# Pipeline-aware deny patterns: matched against the FULL raw command string
# BEFORE segmentation.  These detect cross-pipeline dangers like curl|sh and
# fork bombs whose syntax spans segment boundaries.
DENY_PIPELINE_PATTERNS: list[tuple[str, str]] = [
    # Pipe-to-shell (network exfiltration) — must match across | boundary
    (r"\b(curl|wget)\b.*\|\s*(ba)?sh\b", "pipe-to-shell execution"),
    # Fork bombs — special syntax that segmentation mangles
    (r":\(\)\s*\{.*:\|:.*\}\s*;\s*:", "fork bomb"),
    (r"\bwhile\s+true\b.*\bfork\b", "fork loop"),
]

# Segment-level regex patterns that are always hard-blocked.
# These are matched against individual parsed command segments, NOT the raw
# command string.  Quoted literals in other segments will not trigger them.
DENY_SEGMENT_PATTERNS: list[tuple[str, str]] = [
    # System destruction
    (r"\bdd\b.*\bif=/dev/(zero|random)\b", "dd with destructive input"),
    (r"\bmkfs\.", "filesystem format"),
    (r"\bfdisk\b", "disk partitioning"),
    (r">\s*/dev/sd", "raw device write"),
    # Permission escalation
    (r"\bchmod\b.*\+s\b", "setuid/setgid bit"),
    # System control
    (r"\b(shutdown|reboot)\b", "system shutdown/reboot"),
    (r"\binit\s+[06]\b", "system runlevel change"),
]

# Segment-level regex patterns that require user confirmation.
CONFIRM_SEGMENT_PATTERNS: list[tuple[str, str]] = [
    # Git destructive operations
    (r"\bgit\s+reset\s+--hard\b", "git reset --hard"),
    (r"\bgit\s+push\s+(-f\b|--force\b|--force-with-lease\b)", "git force push"),
    (r"\bgit\s+clean\s+-[a-zA-Z]*f", "git clean with force"),
    (r"\bgit\s+checkout\s+\.\s*$", "git checkout . (discard all changes)"),
    (r"\bgit\s+restore\s+\.\s*$", "git restore . (discard all changes)"),
    (r"\bgit\s+rebase\b", "git rebase (rewrites branch history)"),
    (r"\bgit\s+cherry-pick\b", "git cherry-pick (replays commits across branches)"),
    # chmod 777
    (r"\bchmod\b.*\b777\b", "chmod 777"),
    # History manipulation
    (r"\bhistory\s+-c\b", "history clear"),
    # sudo (not in allowed list)
    (r"^sudo\s+(?!npm|yarn|pnpm|brew|apt-get|apt|dnf|yum)", "sudo command"),
    # venv creation (sprawl prevention)
    (r"\bpython3?\s+-m\s+venv\b", "virtual environment creation"),
    (r"\bvirtualenv\s", "virtual environment creation"),
    (r"\bconda\s+create\b", "conda environment creation"),
    # git init (unless CAWS worktree context)
    (r"\bgit\s+init\b", "git init"),
    # Credential file reads
    (r"\bcat\b.*\.(env|ssh/|aws/)", "credential file read"),
    (r"\bcat\b.*/etc/(passwd|shadow)\b", "system credential read"),
    (r"\bcat\b.*(id_rsa|credentials)\b", "credential file read"),
]


# ---------------------------------------------------------------------------
# Command segmentation
# ---------------------------------------------------------------------------

def segment_command(raw: str) -> list[str]:
    """Split a shell command string on &&, ||, ;, | operators.

    Respects quoted strings so that e.g. git commit -m "rm -rf /" does not
    split inside the quotes.  Returns individual command segments with
    leading/trailing whitespace stripped.

    This is intentionally conservative: if we cannot parse, we return
    the entire string as one segment so it still gets classified.
    """
    segments: list[str] = []
    current: list[str] = []
    i = 0
    in_single = False
    in_double = False
    in_heredoc: str | None = None
    heredoc_marker: str = ""

    while i < len(raw):
        ch = raw[i]

        # ---- heredoc detection ----
        # Look for <<EOF or <<'EOF' or <<"EOF" at segment level
        if not in_single and not in_double and in_heredoc is None:
            if raw[i:i+2] == "<<":
                # Extract the delimiter
                j = i + 2
                while j < len(raw) and raw[j] in (' ', '\t'):
                    j += 1
                # Strip optional quotes around delimiter
                quote_char = None
                if j < len(raw) and raw[j] in ("'", '"'):
                    quote_char = raw[j]
                    j += 1
                k = j
                while k < len(raw) and raw[k] not in (' ', '\t', '\n', "'", '"', ')'):
                    k += 1
                if k > j:
                    heredoc_marker = raw[j:k]
                    in_heredoc = heredoc_marker
                    # Skip to end of this line
                    nl = raw.find('\n', i)
                    if nl >= 0:
                        current.append(raw[i:nl+1])
                        i = nl + 1
                    else:
                        current.append(raw[i:])
                        i = len(raw)
                    continue

        # ---- inside heredoc: scan for closing marker ----
        if in_heredoc is not None:
            nl = raw.find('\n', i)
            if nl < 0:
                # No newline found, rest is heredoc content
                current.append(raw[i:])
                i = len(raw)
                continue
            line = raw[i:nl]
            current.append(raw[i:nl+1])
            i = nl + 1
            if line.strip() == in_heredoc:
                in_heredoc = None
            continue

        # ---- quoting ----
        if ch == '\\' and not in_single:
            current.append(raw[i:i+2])
            i += 2
            continue
        if ch == "'" and not in_double:
            in_single = not in_single
            current.append(ch)
            i += 1
            continue
        if ch == '"' and not in_single:
            in_double = not in_double
            current.append(ch)
            i += 1
            continue

        # ---- segment separators (only outside quotes) ----
        if not in_single and not in_double:
            # && or ||
            if raw[i:i+2] in ('&&', '||'):
                seg = ''.join(current).strip()
                if seg:
                    segments.append(seg)
                current = []
                i += 2
                continue
            # ; (but not ;;)
            if ch == ';' and (i + 1 >= len(raw) or raw[i+1] != ';'):
                seg = ''.join(current).strip()
                if seg:
                    segments.append(seg)
                current = []
                i += 1
                continue
            # | (but not ||, already handled above)
            if ch == '|':
                seg = ''.join(current).strip()
                if seg:
                    segments.append(seg)
                current = []
                i += 1
                continue

        current.append(ch)
        i += 1

    seg = ''.join(current).strip()
    if seg:
        segments.append(seg)

    return segments if segments else [raw.strip()]


def strip_quotes(s: str) -> str:
    """Remove surrounding quotes from a shell token."""
    if len(s) >= 2:
        if (s[0] == '"' and s[-1] == '"') or (s[0] == "'" and s[-1] == "'"):
            return s[1:-1]
    return s


def extract_command_word(segment: str) -> str:
    """Extract the first command word from a segment.

    Strips leading variable assignments (FOO=bar), env prefixes,
    and common wrappers like 'time'.
    """
    try:
        tokens = shlex.split(segment)
    except ValueError:
        # Malformed quoting — return raw first word
        return segment.split()[0] if segment.split() else ""

    for tok in tokens:
        # Skip variable assignments
        if '=' in tok and not tok.startswith('-'):
            continue
        # Skip common prefixes
        if tok in ('env', 'time', 'nice', 'nohup', 'command', 'builtin'):
            continue
        return tok
    return ""


# ---------------------------------------------------------------------------
# rm classifier
# ---------------------------------------------------------------------------

def is_recursive_rm(segment: str) -> tuple[bool, list[str]]:
    """Check if a segment is an rm command with recursive flags.

    Returns (is_recursive, [target_paths]).
    """
    try:
        tokens = shlex.split(segment)
    except ValueError:
        # Cannot parse — be conservative
        if re.search(r'\brm\b', segment) and re.search(r'-[a-zA-Z]*r', segment):
            return True, []
        return False, []

    if not tokens:
        return False, []

    # Find the rm command (skip env/time prefixes)
    rm_idx = -1
    for idx, tok in enumerate(tokens):
        if tok in ('env', 'time', 'nice', 'nohup', 'command', 'builtin'):
            continue
        if '=' in tok and not tok.startswith('-'):
            continue
        if tok == 'rm':
            rm_idx = idx
        break

    if rm_idx < 0:
        return False, []

    # Check for recursive flag
    is_recursive = False
    targets: list[str] = []
    i = rm_idx + 1
    while i < len(tokens):
        tok = tokens[i]
        if tok == '--':
            # Everything after -- is targets
            targets.extend(tokens[i+1:])
            break
        if tok.startswith('-') and not tok.startswith('--'):
            if 'r' in tok or 'R' in tok:
                is_recursive = True
        elif tok.startswith('--'):
            if tok == '--recursive':
                is_recursive = True
            # Other long options: skip
        else:
            targets.append(tok)
        i += 1

    return is_recursive, targets


def classify_rm_target(
    target: str,
    repo_root: Path,
    home: Path,
    cwd: Path,
) -> tuple[str, str]:
    """Classify a single rm target path.

    Returns ("deny"|"ask"|"allow", reason).
    """
    # Resolve the target to an absolute path
    raw = target.strip()
    if not raw:
        return "deny", "empty target on recursive delete"

    # Handle glob-like patterns conservatively
    if any(c in raw for c in ('*', '?', '[', ']')):
        # Check if it is /* or ~/* which are catastrophic
        stripped = raw.rstrip('/')
        if stripped in ('/*', '~/*', './*'):
            return "deny", f"glob expansion at dangerous root: {raw}"
        # Other globs: confirm
        return "ask", f"recursive delete with glob pattern: {raw}"

    # Resolve path
    try:
        if raw.startswith('~'):
            resolved = (home / raw[2:]).resolve(strict=False) if len(raw) > 1 else home
        elif raw.startswith('/'):
            resolved = Path(raw).resolve(strict=False)
        else:
            resolved = (cwd / raw).resolve(strict=False)
    except (ValueError, OSError):
        return "ask", f"cannot resolve path: {raw}"

    resolved_str = str(resolved)
    repo_str = str(repo_root)
    home_str = str(home)

    # Hard-block: root, home, repo root
    if resolved_str == '/':
        return "deny", f"recursive delete targets filesystem root"
    if resolved_str == home_str:
        return "deny", f"recursive delete targets home directory"
    if resolved_str == repo_str:
        return "deny", f"recursive delete targets repository root"

    # Check if resolved path is a parent of repo or home (even worse)
    if repo_str.startswith(resolved_str + '/'):
        return "deny", f"recursive delete targets ancestor of repository: {raw}"
    if home_str.startswith(resolved_str + '/'):
        return "deny", f"recursive delete targets ancestor of home directory: {raw}"

    # Allow: known safe prefixes (relative to repo root)
    try:
        rel = resolved.relative_to(repo_root)
        rel_str = str(rel) + '/'
        for prefix in SAFE_DELETE_PREFIXES:
            if rel_str.startswith(prefix):
                return "allow", ""
    except ValueError:
        pass  # Not inside repo root

    # Default: confirm
    return "ask", f"recursive delete: {raw}"


def classify_find_delete(segment: str) -> tuple[str, str] | None:
    """Check if segment is a find command with -delete or -exec rm.

    Returns classification tuple or None if not a find-delete.
    """
    try:
        tokens = shlex.split(segment)
    except ValueError:
        return None

    cmd = extract_command_word(segment)
    if cmd != 'find':
        return None

    has_delete = '-delete' in tokens
    has_exec_rm = False
    for i, tok in enumerate(tokens):
        if tok == '-exec' and i + 1 < len(tokens) and 'rm' in tokens[i + 1]:
            has_exec_rm = True
            break

    if not has_delete and not has_exec_rm:
        return None

    return "ask", f"find with delete action"


def strip_quoted_regions(raw: str) -> str:
    """Remove content inside single/double quotes and heredocs.

    Returns only the executable shell surface — quoted literals, heredoc
    bodies, and $(...) subshell content embedded in quotes are replaced
    with whitespace so that regex patterns only match actual commands.
    """
    result: list[str] = []
    i = 0
    in_single = False
    in_double = False
    in_heredoc: str | None = None

    while i < len(raw):
        ch = raw[i]

        # Heredoc detection (outside quotes)
        if not in_single and not in_double and in_heredoc is None:
            if raw[i:i+2] == "<<":
                j = i + 2
                while j < len(raw) and raw[j] in (' ', '\t'):
                    j += 1
                if j < len(raw) and raw[j] in ("'", '"'):
                    j += 1
                k = j
                while k < len(raw) and raw[k] not in (' ', '\t', '\n', "'", '"', ')'):
                    k += 1
                if k > j:
                    in_heredoc = raw[j:k]
                    # Keep the << marker but skip to end of line
                    result.append(raw[i:i+2])
                    nl = raw.find('\n', i)
                    if nl >= 0:
                        i = nl + 1
                    else:
                        i = len(raw)
                    continue

        # Inside heredoc: skip until closing marker
        if in_heredoc is not None:
            nl = raw.find('\n', i)
            if nl < 0:
                i = len(raw)
                continue
            line = raw[i:nl]
            i = nl + 1
            if line.strip() == in_heredoc:
                in_heredoc = None
            else:
                result.append(' ')  # placeholder
            continue

        # Escape handling
        if ch == '\\' and not in_single:
            result.append(' ')
            i += 2
            continue

        # Quote tracking
        if ch == "'" and not in_double:
            if in_single:
                in_single = False
            else:
                in_single = True
            i += 1
            continue
        if ch == '"' and not in_single:
            if in_double:
                in_double = False
            else:
                in_double = True
            i += 1
            continue

        # Inside quotes: replace with space
        if in_single or in_double:
            result.append(' ')
            i += 1
            continue

        result.append(ch)
        i += 1

    return ''.join(result)


# ---------------------------------------------------------------------------
# Main classifier
# ---------------------------------------------------------------------------

def classify_command(
    raw_command: str,
    repo_root: Path,
    home: Path,
    cwd: Path,
    caws_worktree: bool = False,
) -> tuple[str, str]:
    """Classify a full command string.

    Returns the most restrictive (decision, reason) across all segments.
    Priority: deny > ask > allow.
    """
    worst_decision = "allow"
    worst_reason = ""

    def escalate(decision: str, reason: str) -> None:
        nonlocal worst_decision, worst_reason
        priority = {"allow": 0, "ask": 1, "deny": 2}
        if priority.get(decision, 0) > priority.get(worst_decision, 0):
            worst_decision = decision
            worst_reason = reason

    # --- Pipeline-aware deny patterns ---
    # Strip quoted regions so patterns only match executable shell surface.
    # This prevents commit messages, echo arguments, etc. from triggering.
    executable_surface = strip_quoted_regions(raw_command)
    for pattern, desc in DENY_PIPELINE_PATTERNS:
        if re.search(pattern, executable_surface, re.IGNORECASE):
            escalate("deny", desc)

    segments = segment_command(raw_command)

    for segment in segments:
        # Strip quoted regions for pattern matching so that e.g.
        # echo "git reset --hard" does not trigger the git pattern.
        # The original segment is still used for rm/find parsing
        # (shlex.split handles quotes correctly for argument extraction).
        segment_surface = strip_quoted_regions(segment)

        # --- Hard-block patterns (segment-level) ---
        for pattern, desc in DENY_SEGMENT_PATTERNS:
            if re.search(pattern, segment_surface, re.IGNORECASE):
                escalate("deny", desc)

        # --- Confirm patterns (segment-level) ---
        for pattern, desc in CONFIRM_SEGMENT_PATTERNS:
            if re.search(pattern, segment_surface, re.IGNORECASE):
                # Special case: git init in worktree context is allowed
                if "git init" in desc and caws_worktree:
                    continue
                escalate("ask", desc)

        # --- rm classifier ---
        is_recursive, targets = is_recursive_rm(segment)
        if is_recursive:
            if not targets:
                # Cannot determine targets — be conservative
                escalate("ask", "recursive delete with unparseable targets")
            else:
                for target in targets:
                    decision, reason = classify_rm_target(
                        target, repo_root, home, cwd,
                    )
                    escalate(decision, reason)

        # --- find -delete classifier ---
        find_result = classify_find_delete(segment)
        if find_result:
            escalate(*find_result)

    return worst_decision, worst_reason


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Classify shell command safety")
    parser.add_argument("--repo-root", default=os.environ.get("CLAUDE_PROJECT_DIR", "."))
    parser.add_argument("--home", default=str(Path.home()))
    parser.add_argument("--cwd", default=os.getcwd())
    args = parser.parse_args()

    raw_command = sys.stdin.read()

    repo_root = Path(args.repo_root).resolve(strict=False)
    home = Path(args.home).resolve(strict=False)
    cwd = Path(args.cwd).resolve(strict=False)
    caws_worktree = os.environ.get("CAWS_WORKTREE_CONTEXT", "0") == "1"

    decision, reason = classify_command(
        raw_command, repo_root, home, cwd, caws_worktree,
    )

    json.dump({"decision": decision, "reason": reason}, sys.stdout)


if __name__ == "__main__":
    main()
