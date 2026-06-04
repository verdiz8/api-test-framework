import { ApiClient } from "../client";
import { validateSchema } from "../utils/schema-validator";
import {
  userSchema,
  userListSchema,
  createUserResponseSchema,
} from "../contracts/user.schema";

/**
 * Contract tests — validate that the API response shape matches the expected schema.
 * These catch breaking changes before functional tests even run.
 */

const api = new ApiClient();

describe("Contract — GET /users/:id", () => {
  it("single user response matches schema", async () => {
    const { status, data } = await api.get("/users/2");
    expect(status).toBe(200);

    const { valid, errors } = validateSchema(userSchema, data);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });
});

describe("Contract — GET /users", () => {
  it("user list response matches schema", async () => {
    const { status, data } = await api.get("/users?page=1");
    expect(status).toBe(200);

    const { valid, errors } = validateSchema(userListSchema, data);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it("paginated list has correct page metadata", async () => {
    const { data } = await api.get<{
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    }>("/users?page=1");

    expect(data.page).toBe(1);
    expect(data.per_page).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
    expect(data.total_pages).toBeGreaterThan(0);
  });
});

describe("Contract — POST /users", () => {
  it("create user response matches schema", async () => {
    const { status, data } = await api.post("/users", {
      name: "morpheus",
      job: "leader",
    });
    expect(status).toBe(201);

    const { valid, errors } = validateSchema(createUserResponseSchema, data);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });
});
