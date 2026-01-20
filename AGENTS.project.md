# Project Addenda for CAWS

## Project Profiles

- **Primary Profile**: web-ui
- **Secondary Profiles**: backend-api
- **Justification**: The app is a Next.js web UI with server route handlers and
  Supabase-backed data writes for content publishing.

## Service Matrix

- **Databases**: PostgreSQL (Supabase)
- **Message Queues**: None
- **External APIs**: Supabase Auth, Supabase Storage
- **Test Data Strategy**: Synthetic fixtures, no PII; JSON fixtures for editor
  content

## Performance Budgets

- **Web UI**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **API**: P95 < 300ms for article write routes
- **Measurement Harness**: Lighthouse CI for UI, custom API timing via tests

## A11y & i18n Targets

- **Supported Locales**: en-US
- **RTL Support**: No
- **Assistive Technology**: Screen readers, keyboard navigation
- **Compliance Level**: WCAG 2.1 AA

## Security Policy Overrides

- **Temporary Leniency**: None
- **Compensating Controls**: None
- **Risk Acceptance**: None

## Tool Adapters

```makefile
caws:bootstrap:
	npm ci

caws:unit:
	npm run test:coverage

caws:mutation:
	npm run test:mutation

caws:contracts:
	npm run test:contract

caws:integration:
	npm run test:integration

caws:e2e:
	npm run test:e2e:smoke

caws:a11y:
	npm run test:axe

caws:perf:
	npm run perf:budgets
```

## CI Provider Adapter

- **Primary**: GitHub Actions
- **Alternative**: None
- **Runner Requirements**: Node 20, Docker (for Testcontainers)

## Data Classifications

- **Public**: Published articles and public metadata
- **Internal**: Draft content, internal metrics
- **Confidential**: None (PII excluded from fixtures and traces)
