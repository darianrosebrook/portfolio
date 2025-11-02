# Lighthouse Performance Audit Results

This directory stores Lighthouse CI performance audit results.

## Usage

### Run Desktop Audit

```bash
npm run perf:budgets
```

### Run Mobile Audit

```bash
npm run perf:budgets:mobile
```

### Run Single Page Audit

```bash
npm run perf:audit
```

### Run Full Audit (Build + Start Server + Audit)

```bash
npm run perf:audit:all
```

## Performance Budgets

### Desktop Targets

- **Performance Score**: ≥ 85/100
- **LCP** (Largest Contentful Paint): ≤ 2.5s
- **TBT** (Total Blocking Time): ≤ 200ms
- **CLS** (Cumulative Layout Shift): ≤ 0.1
- **FCP** (First Contentful Paint): ≤ 1.8s
- **Speed Index**: ≤ 3.4s

### Mobile Targets (Slightly More Lenient)

- **Performance Score**: ≥ 80/100
- **LCP**: ≤ 3.0s
- **TBT**: ≤ 300ms
- **CLS**: ≤ 0.1
- **FCP**: ≤ 2.0s
- **Speed Index**: ≤ 4.0s

## CI Integration

Lighthouse audits run automatically on:

- Pull requests (opened, synchronized, reopened)
- Pushes to main branch
- Manual workflow dispatch

Results are uploaded as artifacts and commented on PRs.
