// k6 load test — ReqRes API
// Run: npx k6 run k6/load-test.js
//
// This simulates a realistic traffic pattern:
//   - Ramp up from 0 to 50 virtual users over 30s
//   - Hold at 50 VUs for 60s
//   - Ramp down to 0 over 10s
//
// Thresholds define the pass/fail criteria:
//   - 95% of requests must complete within 2s
//   - Error rate must stay below 1%

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // ramp up
    { duration: "60s", target: 50 }, // steady state
    { duration: "10s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests < 2s
    http_req_failed: ["rate<0.01"], // error rate < 1%
  },
};

const BASE_URL = "https://reqres.in/api";
const API_KEY = __ENV.REQRES_API_KEY || "";

const PARAMS = {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
};

export default function () {
  // Mix of read and write — real traffic isn't all GETs

  // List users (read-heavy, should be fast)
  const list = http.get(`${BASE_URL}/users?page=1`, PARAMS);
  check(list, { "list users OK": (r) => r.status === 200 });

  // Single user
  const single = http.get(`${BASE_URL}/users/2`, PARAMS);
  check(single, { "single user OK": (r) => r.status === 200 });

  // Create user (write — heavier)
  const create = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({ name: "morpheus", job: "leader" }),
    PARAMS
  );
  check(create, { "create user OK": (r) => r.status === 201 });

  // Login
  const login = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({ email: "eve.holt@reqres.in", password: "cityslicka" }),
    PARAMS
  );
  check(login, { "login OK": (r) => r.status === 200 });

  // Random sleep between 1-3s to simulate real user think time
  sleep(Math.random() * 2 + 1);
}
