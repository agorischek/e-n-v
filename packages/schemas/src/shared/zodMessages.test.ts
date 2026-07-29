import { describe, expect, it } from "bun:test";

import { toZodMessage, toZodMessageArray } from "./zodMessages";

describe("Zod message formatting", () => {
  it("prefixes descriptive fragments", () => {
    expect(toZodMessage("at least 8 characters long")).toBe(
      "Must at least 8 characters long",
    );
  });

  it("preserves complete required and empty-value clauses", () => {
    expect(toZodMessage("database host is required")).toBe(
      "Database host is required",
    );
    expect(toZodMessage("Redis username cannot be empty")).toBe(
      "Redis username cannot be empty",
    );
    expect(toZodMessage("Must use https://")).toBe("Must use https://");
  });

  it("formats fragment arrays as one requirement", () => {
    expect(toZodMessageArray(["start with 'sk-'", "contain underscores"])).toBe(
      "Must start with 'sk-' and contain underscores",
    );
  });
});
