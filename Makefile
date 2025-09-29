# CAWS Build System for Visual Regression Testing
# Engineering-grade operating system for coding agents

.PHONY: caws:bootstrap caws:static caws:unit caws:mutation caws:contracts caws:integration caws:e2e caws:a11y caws:perf caws:visual-regression

# Bootstrap the development environment
caws:bootstrap:
	npm ci

# Static analysis (type checking, linting, security)
caws:static:
	npm run typecheck
	npm run lint

# Unit tests with coverage
caws:unit:
	npm run test:coverage

# Mutation testing
caws:mutation:
	npm run test:mutation

# Contract tests (API/GraphQL/Pact)
caws:contracts:
	npm run test:contract

# Integration tests (Testcontainers, database, external services)
caws:integration:
	npm run test:integration

# End-to-end smoke tests (Playwright/Cypress)
caws:e2e:
	npm run test:e2e:smoke

# Accessibility testing (axe-core)
caws:a11y:
	npm run test:axe

# Performance testing (Lighthouse CI, k6)
caws:perf:
	npm run perf:budgets

# Visual regression testing (Playwright screenshot comparison)
caws:visual-regression:
	npm run test:e2e

# Quick development setup
dev-setup: caws:bootstrap
	npm run tokens:build
	npm run components:setup

# Health check for all components
health-check:
	npm run components:health

# Clean build artifacts
clean:
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf test-results
	rm -rf playwright-report
	rm -rf coverage
