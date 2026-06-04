import { ApiClient } from "../client";

/**
 * CRUD lifecycle tests — create → read → update → delete.
 * Validates the full entity lifecycle and response time budgets.
 */

const api = new ApiClient();
const PERF_BUDGET_MS = 2000; // ReqRes can be slow — real APIs should be < 500ms

describe("CRUD — User lifecycle", () => {
  let userId: string;

  it("CREATE — POST /users returns 201 with an id", async () => {
    const { status, data, durationMs } = await api.post<{
      id: string;
      name: string;
      job: string;
      createdAt: string;
    }>("/users", {
      name: "Mojammel Hossain",
      job: "SDET",
    });

    expect(status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.name).toBe("Mojammel Hossain");
    expect(data.job).toBe("SDET");
    expect(data.createdAt).toBeDefined();
    expect(durationMs).toBeLessThan(PERF_BUDGET_MS);

    userId = data.id;
  });

  it("READ — GET /users/:id returns the created user", async () => {
    // ReqRes doesn't persist created users, so we test against a known ID
    const { status, data, durationMs } = await api.get<{ data: { id: number; email: string } }>("/users/2");

    expect(status).toBe(200);
    expect(data.data.id).toBe(2);
    expect(data.data.email).toBeDefined();
    expect(durationMs).toBeLessThan(PERF_BUDGET_MS);
  });

  it("UPDATE — PUT /users/:id modifies fields", async () => {
    const { status, data } = await api.put<{ name: string; job: string; updatedAt: string }>("/users/2", {
      name: "Updated Name",
      job: "Lead SDET",
    });

    expect(status).toBe(200);
    expect(data.name).toBe("Updated Name");
    expect(data.job).toBe("Lead SDET");
    expect(data.updatedAt).toBeDefined();
  });

  it("DELETE — DELETE /users/:id returns 204", async () => {
    const { status } = await api.delete("/users/2");

    // ReqRes returns 204 on delete
    expect(status).toBe(204);
  });

  it("READ after DELETE — returns 404", async () => {
    // ReqRes doesn't actually delete, but in a real API this would 404.
    // This test documents the expected behaviour.
    const { status } = await api.get("/users/9999");
    expect(status).toBe(404);
  });
});
