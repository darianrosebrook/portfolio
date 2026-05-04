#!/bin/bash
# Auto-install git hooks when entering portfolio directory
# Add this to your .zshrc: source /path/to/portfolio/scripts/git-hooks-install.sh

PORTFOLIO_DIR="$HOME/Desktop/Projects/portfolio"

# Only run in portfolio directory
if [[ "$PWD" == "$PORTFOLIO_DIR"* ]] && [ -d "$PORTFOLIO_DIR/.git" ]; then
  # Check if hooks are already installed and up to date
  if [ ! -f "$PORTFOLIO_DIR/.git/hooks/pre-commit" ] || \
     [ "$PORTFOLIO_DIR/.git/hooks/pre-commit" -ot "$PORTFOLIO_DIR/scripts/setup-hooks.sh" ]; then
    echo "🔧 Installing git hooks for portfolio..."
    (cd "$PORTFOLIO_DIR" && npm run setup:hooks > /dev/null 2>&1)
  fi
fi

# Function to manually install/update hooks
install-portfolio-hooks() {
  if [ -d "$PORTFOLIO_DIR" ]; then
    echo "🔧 Installing/updating git hooks for portfolio..."
    (cd "$PORTFOLIO_DIR" && npm run setup:hooks)
  else
    echo "❌ Portfolio directory not found at $PORTFOLIO_DIR"
  fi
}

