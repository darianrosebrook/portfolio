# Claude Code Integration for CAWS

This directory contains Claude Code hooks and configuration for CAWS (Coding Agent Working Standard) integration.

## Overview

CAWS hooks for Claude Code provide:

- **Safety Gates**: Block dangerous commands and scan for secrets
- **Quality Gates**: Run CAWS quality checks after file edits
- **Scope Guards**: Validate edits against the working spec's scope
- **Audit Logging**: Track agent actions for compliance

## Directory Structure

```
.claude/
├── settings.json      # Claude Code settings with hooks configuration
├── hooks/             # Hook scripts
│   ├── audit.sh           # Session and action logging
│   ├── block-dangerous.sh # Block destructive commands
│   ├── scan-secrets.sh    # Warn when reading sensitive files
│   ├── quality-check.sh   # Run CAWS quality gates
│   ├── validate-spec.sh   # Validate spec files
│   ├── scope-guard.sh     # Check scope boundaries
│   └── naming-check.sh    # Validate file naming conventions
├── logs/              # Audit logs (gitignored)
└── README.md          # This file
```

## Hook Events

### PreToolUse Hooks

Run before Claude executes a tool:

| Hook | Matcher | Purpose |
|------|---------|---------|
| `block-dangerous.sh` | `Bash` | Block destructive shell commands |
| `scan-secrets.sh` | `Read` | Warn when reading sensitive files |
| `scope-guard.sh` | `Write\|Edit` | Check scope boundaries before edits (use `caws scope show` to diagnose blocks) |

### PostToolUse Hooks

Run after Claude executes a tool:

| Hook | Matcher | Purpose |
|------|---------|---------|
| `quality-check.sh` | `Write\|Edit` | Run CAWS quality gates |
| `validate-spec.sh` | `Write\|Edit` | Validate spec file changes |
| `naming-check.sh` | `Write` | Check file naming conventions |
| `audit.sh` | `Write\|Edit\|Bash` | Log tool usage |

### Session Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `audit.sh session-start` | `SessionStart` | Log session start |
| `audit.sh stop` | `Stop` | Log session end |

## Configuration

### Enable/Disable Hooks

Edit `settings.json` to enable or disable specific hooks. Remove entries from the `hooks` object to disable them.

### Hook Levels

The scaffold supports four hook levels:

- **safety**: Block dangerous commands, scan for secrets
- **quality**: Run quality gates on file edits
- **scope**: Validate edits against spec scope
- **audit**: Log all agent actions

Run `caws init --hooks=safety,quality` to enable specific levels.

## Audit Logs

Audit logs are written to `.claude/logs/`:

- `audit.log` - All-time log (appended)
- `audit-YYYY-MM-DD.log` - Daily logs

Logs are JSON-formatted for easy parsing:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "session_id": "abc123",
  "event": "tool_use",
  "tool": "Write",
  "file": "src/index.ts",
  "cwd": "/project"
}
```

## Customization

### Adding Custom Hooks

1. Create a new script in `.claude/hooks/`
2. Make it executable: `chmod +x .claude/hooks/my-hook.sh`
3. Add it to `settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/my-hook.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Hook Input/Output

Hooks receive JSON input via stdin:

```json
{
  "session_id": "abc123",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "content": "..."
  },
  "tool_response": { "success": true }
}
```

Hooks can output JSON to control Claude's behavior:

```json
{
  "decision": "block",
  "reason": "Quality gate failed: ..."
}
```

Or add context:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Remember to update the tests."
  }
}
```

## Troubleshooting

### Hooks Not Running

1. Check `settings.json` syntax: `cat .claude/settings.json | jq .`
2. Verify scripts are executable: `ls -la .claude/hooks/`
3. Test hooks manually: `echo '{}' | .claude/hooks/audit.sh`

### Permission Errors

Make all hook scripts executable:

```bash
chmod +x .claude/hooks/*.sh
```

### Debug Hooks

Run Claude Code with `--debug` to see hook execution details:

```bash
claude --debug
```

## Further Reading

- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [CAWS Quality Gates](../../docs/quality-gates.md)
- [CAWS Scope Management](../../docs/scope-management.md)
