import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api";

describe("ApiError", () => {
  it("creates an error with correct properties", () => {
    const error = new ApiError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("ApiError");
    expect(error instanceof Error).toBe(true);
  });

  it("stores details", () => {
    const details = { field: "email", reason: "invalid" };
    const error = new ApiError(422, "Validation failed", details);
    expect(error.details).toEqual(details);
  });
});

describe("Auth validation schema", () => {
  it("rejects empty email", async () => {
    const { z } = await import("zod");
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid email", async () => {
    const { z } = await import("zod");
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects short password", async () => {
    const { z } = await import("zod");
    const schema = z.object({ password: z.string().min(6) });
    const result = schema.safeParse({ password: "123" });
    expect(result.success).toBe(false);
  });
});
