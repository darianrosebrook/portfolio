#!/bin/bash

# Setup script to install pre-push git hooks
# Run this script after cloning the repository: npm run setup:hooks

echo "🔧 Setting up git pre-push hook..."

# Create the pre-push hook
cat > .git/hooks/pre-push << 'HOOK_EOF'
#!/bin/sh

# Pre-push hook to run checks before allowing push
# This ensures code quality and prevents build failures

echo "🔍 Running pre-push checks..."

# Run TypeScript type checking
echo "📝 Checking TypeScript types..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ TypeScript type check failed. Please fix errors before pushing."
  exit 1
fi

# Run Prettier check (using .prettierignore to exclude generated files)
echo "✨ Checking code formatting..."
npx prettier --check . --ignore-path .prettierignore
if [ $? -ne 0 ]; then
  echo "❌ Prettier check failed. Please run 'npx prettier --write .' to fix formatting."
  exit 1
fi

# Run ESLint
echo "🔎 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint check failed. Please fix linting errors before pushing."
  exit 1
fi

echo "✅ All pre-push checks passed!"
exit 0
HOOK_EOF

# Make it executable
chmod +x .git/hooks/pre-push

echo "✅ Pre-push hook installed successfully!"
echo ""
echo "The hook will now run automatically before every git push."
echo "To bypass (not recommended), use: git push --no-verify"

