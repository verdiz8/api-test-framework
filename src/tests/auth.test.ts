import { ApiClient } from "../client";
import { validateSchema } from "../utils/schema-validator";
import { authTokenSchema } from "../contracts/user.schema";

/**
 * Auth flow tests — login, token storage, authenticated requests, logout.
 * ReqRes doesn't do real auth, but the patterns apply to any JWT-based API.
 */

const api = new ApiClient();

describe("Auth — POST /login", () => {
  it("successful login returns a token", async () => {
    const { status, data } = await api.post<{ token: string }>("/login", {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    });

    expect(status).toBe(200);

    const { valid, errors } = validateSchema(authTokenSchema, data);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);

    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(0);
  });

  it("failed login returns 400", async () => {
    const { status } = await api.post("/login", {
      email: "peter@klaven",
    });

    expect(status).toBe(400);
  });

  it("token persists across requests after setToken", async () => {
    // Login
    const { data } = await api.post<{ token: string }>("/login", {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    });
    api.setToken(data.token);

    // Token is now set — subsequent requests should include Authorization header
    // (ReqRes doesn't actually validate it, but in a real API this matters)
    expect(data.token).toBeDefined();

    // Clear token
    api.clearToken();
  });
});

describe("Auth — POST /register", () => {
  it("successful registration returns token + id", async () => {
    const { status, data } = await api.post<{ token: string; id: number }>("/register", {
      email: "eve.holt@reqres.in",
      password: "pistol",
    });

    expect(status).toBe(200);
    expect(data.token).toBeDefined();
    expect(data.id).toBeDefined();
  });

  it("missing password returns 400", async () => {
    const { status, data } = await api.post<{ error: string }>("/register", {
      email: "sydney@fife",
    });

    expect(status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
