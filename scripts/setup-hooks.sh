#!/bin/bash

# Setup script to install git hooks
# Run this script after cloning the repository: npm run setup:hooks

echo "🔧 Setting up git hooks..."

# Install the pre-commit hook
if [ -f "scripts/pre-commit.template" ]; then
  cp scripts/pre-commit.template .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo "✅ Pre-commit hook installed from template"
elif [ -f ".git/hooks/pre-commit" ]; then
  # Use existing hook if template doesn't exist (development scenario)
  chmod +x .git/hooks/pre-commit
  echo "✅ Using existing pre-commit hook"
else
  echo "⚠️  Pre-commit template not found. Using minimal version."
  cat > .git/hooks/pre-commit << 'PRE_COMMIT_MINIMAL'
#!/bin/sh
echo "🔒 Secret detection hook not fully installed."
echo "Run: npm run setup:hooks"
exit 0
PRE_COMMIT_MINIMAL
  chmod +x .git/hooks/pre-commit
fi

# Create the pre-push hook
cat > .git/hooks/pre-push << 'PRE_PUSH_EOF'
#!/bin/sh

echo "🔍 Running pre-push checks..."

echo "📝 Checking TypeScript types..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ TypeScript type check failed. Please fix errors before pushing."
  exit 1
fi

echo "✨ Checking code formatting..."
npx prettier --check . --ignore-path .prettierignore
if [ $? -ne 0 ]; then
  echo "❌ Prettier check failed. Please run 'npx prettier --write .' to fix formatting."
  exit 1
fi

echo "🎨 Checking CSS/SCSS formatting..."
npx stylelint --allow-empty-input "**/*.{css,scss}"
if [ $? -ne 0 ]; then
  echo "❌ Stylelint check failed. Please fix CSS/SCSS linting errors before pushing."
  exit 1
fi

echo "🔎 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint check failed. Please fix linting errors before pushing."
  exit 1
fi

echo "🏗️  Checking build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build check failed. Please fix build errors before pushing."
  exit 1
fi

echo "✅ All pre-push checks passed!"
exit 0
PRE_PUSH_EOF

chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Scans for secrets before commit"
echo "  - pre-push: Runs typecheck, linting, and build checks"
echo ""
echo "These hooks run automatically. To bypass (not recommended):"
echo "  git commit --no-verify  (skip pre-commit)"
echo "  git push --no-verify    (skip pre-push)"
