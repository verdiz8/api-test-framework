# API Test Framework ![CI](https://github.com/verdiz8/api-test-framework/actions/workflows/ci.yml/badge.svg)

A test architecture demo — not just tests, but *how* to structure them for maintainability at scale. Built against [ReqRes](https://reqres.in), a public REST API designed for testing.

## What this proves

- **Contract testing** — validate response shapes against JSON Schema before functional tests
- **Auth flow testing** — login, token storage, authenticated requests, error states
- **CRUD lifecycle** — create → read → update → delete with response time budgets
- **Load testing** — k6 scripts with realistic traffic patterns and threshold-based pass/fail
- **Clean client architecture** — thin fetch wrapper with auth injection, response timing, typed responses

## Structure

```
src/
  client.ts              ← Reusable API client
  contracts/*.schema.ts  ← JSON Schema definitions
  utils/schema-validator.ts ← Ajv wrapper with caching
  tests/
    contract.test.ts     ← Schema shape validation
    auth.test.ts         ← Login/register flow
    crud.test.ts         ← Entity lifecycle
k6/
  load-test.js           ← Load test with stages + thresholds
```

## Prerequisites

ReqRes now requires a free API key. Get one at [app.reqres.in/api-keys](https://app.reqres.in/api-keys), then:

```bash
cp .env.example .env
# Edit .env and paste your key: REQRES_API_KEY=your_key_here
```

## Run locally

```bash
npm install
npm test                 # Jest unit/contract tests
npm run load             # k6 load test
```

## Architecture decisions

- **Contract tests first.** If the API shape changes, I want to know immediately — before functional tests muddy the water with business logic failures.
- **Typed API client.** `ApiClient` returns `ApiResponse<T>` — TypeScript enforces the expected response shape across all test files.
- **Schema validation caching.** Ajv validators are compiled once and cached — adds ~0ms overhead on repeated calls.
- **Response timing on every request.** `durationMs` is captured in the client, not opt-in per test. Performance regressions surface automatically.

## Key decisions

See [DECISIONS.md](./DECISIONS.md) for the full decision log — 8 architectural decisions with trade-offs documented.
