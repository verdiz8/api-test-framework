# Decisions

Why this API test framework is structured the way it is.

---

## 1. Contract tests are separate from functional tests

**Options considered:**
- One test file per endpoint with schema validation mixed in
- Separate contract test files
- Skip contract testing, validate shape inside functional tests

**Chosen: Separate contract test files (`contract.test.ts`).**

Mixing schema validation into functional tests creates noise. A contract failure ("the API removed `avatar` from the user object") is a fundamentally different signal than a functional failure ("login returned 401 when I used the right password"). Separating them means:

- Contract failures are instantly recognizable — they're a breaking change, not a bug
- Functional tests can assume the schema is correct and focus on behaviour
- CI can run contracts first, fail fast, skip functional if the API shape broke

---

## 2. Thin API client, not per-endpoint methods

**Options considered:**
- `getUser(id)`, `createUser(body)` methods on the client
- Generic `get<T>(path)`, `post<T>(path, body)` methods
- Raw `fetch()` calls in each test

**Chosen: Generic `get<T>(path)`, `post<T>(path, body)`.**

Per-endpoint methods (`getUser`, `createUser`) scale poorly — every new endpoint adds a method. Raw `fetch()` scatters headers, error handling, and timing logic across test files. The generic approach with a typed return value gives me:

- One place for auth headers, content-type, base URL
- `durationMs` captured on every request with zero test code
- TypeScript generics enforce the expected response shape at the call site

---

## 3. Ajv with validator caching, not inline checks

**Options considered:**
- Inline `expect(data.id).toBeDefined()` checks
- Fresh Ajv instance per validation
- Cached Ajv validators

**Chosen: Cached validators.**

Inline checks are fine for 3 fields, unmaintainable for 30. Fresh Ajv compilation per validation is wasteful — JSON Schema compilation takes measurable time. The `Map`-based cache compiles once, reuses forever. In a suite with 200+ contract tests, this saves ~500ms of startup time.

---

## 4. ReqRes as the test target

**Options considered:**
- JSONPlaceholder
- ReqRes
- A custom Express server

**Chosen: ReqRes.**

JSONPlaceholder is read-only — no POST/PUT/DELETE that returns meaningful responses. A custom server would be fully controllable but adds maintenance burden and isn't reproducible by anyone cloning the repo.

ReqRes supports full CRUD, auth endpoints (login/register), proper HTTP status codes (201 on create, 204 on delete, 400 on bad input), and is publicly hosted. It's the best available target for demonstrating API test architecture.

Note: As of 2026, ReqRes requires a free API key (`x-api-key` header). See decision #8.

---

## 5. k6 load test as a script, not a CI job

**Options considered:**
- Run k6 in CI on every push
- Keep k6 as a manual script
- Skip load testing entirely

**Chosen: Manual script, documented in README.**

Load tests against a public API in CI are unreliable — ReqRes has rate limits and variable latency that would cause spurious CI failures. Running load tests on every push against a third-party service is also impolite.

In a real project, k6 would run in CI against a dedicated staging environment, not a shared public API. The script is here to demonstrate the pattern — stages, thresholds, realistic traffic mix, think-time simulation.

---

## 6. Response timing captured in the client, not per test

**Options considered:**
- `const start = Date.now()` in every test
- Optional timing parameter on the client
- `durationMs` on every response

**Chosen: `durationMs` on every response, captured in the client.**

Opt-in timing means someone forgets to add it. Optional parameters mean inconsistent coverage. By baking timing into the client's `request()` method, every single API call is measured — and any test can assert `expect(durationMs).toBeLessThan(500)` without setup.

---

## 7. Jest over Vitest

**Options considered:**
- Jest
- Vitest
- Node test runner

**Chosen: Jest.**

Vitest is faster for Vite-based projects but this is a pure Node.js test framework. Jest has the largest ecosystem, the most documentation, and is what most enterprise SDET teams use. Node's built-in test runner is maturing but lacks the plugin ecosystem for reporting and CI integration.

---

## 8. API key via environment variable, not hardcoded

**When:** June 2026 — ReqRes began requiring an `x-api-key` header on all endpoints.

**Options considered:**
- Hardcode a shared API key in the client
- Pass the key via constructor
- Read from environment variable

**Chosen: Constructor with `REQRES_API_KEY` env var fallback.**

The client constructor accepts an optional `apiKey` parameter. If omitted, it falls back to `process.env.REQRES_API_KEY`. This means:
- CI can inject the key via environment variable without code changes
- Local dev uses a `.env` file (loaded by `jest.setup.ts` via dotenv)
- Tests don't know or care where the key comes from — they just `new ApiClient()`
- The `.env` file is git-ignored; `.env.example` documents what's needed

---

## What I'd add at scale

1. **OpenAPI spec validation** — validate responses against the published spec, not hand-written schemas
2. **Data factories** — generate test data from factories with randomisation, not hardcoded payloads
3. **Environment matrix** — run against staging + production, compare response shapes
4. **Persistent test data** — seed known entities before the suite, clean up after
5. **Slack/webhook alerts on contract failures** — contract changes should trigger immediate notification
