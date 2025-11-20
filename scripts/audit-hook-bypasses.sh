#!/bin/bash
# View and audit git hook bypass logs

LOG_FILE="$HOME/.git-hook-bypass-log.json"

if [ ! -f "$LOG_FILE" ]; then
  echo "✅ No bypass logs found. No hooks have been bypassed."
  exit 0
fi

echo "📊 Git Hook Bypass Audit Log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if jq is available
if command -v jq &> /dev/null; then
  TOTAL=$(jq 'length' "$LOG_FILE")
  echo "Total bypasses recorded: $TOTAL"
  echo ""
  
  echo "Recent bypasses (last 10):"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  jq -r 'reverse | .[0:10] | .[] | "\(.timestamp) | \(.repo) | \(.user) (\(.email)) | \(.commit[0:8])"' "$LOG_FILE" | \
    column -t -s '|'
  
  echo ""
  echo "By repository:"
  jq -r '.[].repo' "$LOG_FILE" | sort | uniq -c | sort -rn
  
  echo ""
  echo "By user:"
  jq -r '.[].user' "$LOG_FILE" | sort | uniq -c | sort -rn
  
else
  # Fallback without jq
  echo "Install 'jq' for better formatting: brew install jq"
  echo ""
  echo "Raw log file: $LOG_FILE"
  cat "$LOG_FILE"
fi

echo ""
echo "To view full log: cat $LOG_FILE | jq"







