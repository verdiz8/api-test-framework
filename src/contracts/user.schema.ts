/**
 * JSON Schema definitions for the ReqRes API.
 * Contract tests validate actual responses against these schemas.
 * If the API changes shape, these tests fail — that's the point.
 */

export const userSchema = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "object",
      required: ["id", "email", "first_name", "last_name", "avatar"],
      properties: {
        id: { type: "number" },
        email: { type: "string", format: "email" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        avatar: { type: "string", format: "uri" },
      },
    },
  },
};

export const userListSchema = {
  type: "object",
  required: ["page", "per_page", "total", "total_pages", "data"],
  properties: {
    page: { type: "number" },
    per_page: { type: "number" },
    total: { type: "number" },
    total_pages: { type: "number" },
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "email", "first_name", "last_name", "avatar"],
        properties: {
          id: { type: "number" },
          email: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          avatar: { type: "string" },
        },
      },
    },
  },
};

export const createUserResponseSchema = {
  type: "object",
  required: ["id", "createdAt"],
  properties: {
    id: { type: ["string", "number"] },
    createdAt: { type: "string" },
    name: { type: "string" },
    job: { type: "string" },
  },
};

export const authTokenSchema = {
  type: "object",
  required: ["token"],
  properties: {
    token: { type: "string" },
  },
};
