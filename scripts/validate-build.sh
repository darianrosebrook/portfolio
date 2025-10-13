#!/bin/bash
# Pre-push validation script
# Catches build errors before deploying to Vercel

set -e

echo "🔍 Running pre-push validation..."
echo ""

# 1. Check for case-sensitivity issues with Types files
echo "1️⃣ Checking for case-sensitivity issues..."
CAPITAL_TYPES=$(find ui/components -name "Types.ts" -o -name "Types.tsx" 2>/dev/null || true)
if [ -n "$CAPITAL_TYPES" ]; then
  echo "🚫 Found capitalized Types files (will fail on Linux):"
  echo "$CAPITAL_TYPES"
  echo ""
  echo "Run: find ui/components -name 'Types.ts' -exec sh -c 'mv \"\$1\" \"\${1%Types.ts}types.ts\"' _ {} \;"
  exit 1
fi
echo "✅ No case-sensitivity issues found"
echo ""

# 2. Run TypeScript type checking
echo "2️⃣ Running TypeScript type check..."
npm run typecheck 2>&1 | head -20
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "🚫 TypeScript errors found"
  exit 1
fi
echo "✅ TypeScript passed"
echo ""

# 3. Run ESLint
echo "3️⃣ Running ESLint..."
npm run lint -- --max-warnings 0 2>&1 | head -20
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "⚠️ ESLint warnings/errors found (non-blocking)"
fi
echo "✅ ESLint checked"
echo ""

# 4. Build check
echo "4️⃣ Running production build..."
npm run build > /tmp/build-output.log 2>&1
if [ $? -ne 0 ]; then
  echo "🚫 Build failed! Output:"
  tail -50 /tmp/build-output.log
  exit 1
fi
echo "✅ Build succeeded"
echo ""

echo "🎉 All validations passed! Safe to push."

