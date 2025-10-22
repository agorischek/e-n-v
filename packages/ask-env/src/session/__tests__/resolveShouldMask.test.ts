import { describe, expect, it } from "bun:test";
import { resolveShouldMask } from "../Session";
import { StringEnvVarSchema, NumberEnvVarSchema } from "@envcredible/types";

// Create simple processors for testing
const stringProcessor = (value: string) => value;
const numberProcessor = (value: string) => {
  const parsed = Number(value);
  if (isNaN(parsed)) throw new Error("Not a number");
  return parsed;
};

const BASE_STRING_SCHEMA = new StringEnvVarSchema({
  process: stringProcessor,
  required: true,
});

describe("resolveShouldMask", () => {
  it("returns schema secret flag when provided", () => {
    const schema = new StringEnvVarSchema({
      process: stringProcessor,
      required: true,
      secret: true,
    });
    expect(resolveShouldMask("API_KEY", schema, [])).toBe(true);

    const nonSecretSchema = new StringEnvVarSchema({
      process: stringProcessor,
      required: true,
      secret: false,
    });
    expect(resolveShouldMask("API_SECRET", nonSecretSchema, [/secret/i])).toBe(
      false,
    );
  });

  it("falls back to pattern match when schema secret is undefined", () => {
    expect(
      resolveShouldMask("SOME_TOKEN", BASE_STRING_SCHEMA, [/token/i]),
    ).toBe(true);
  });

  it("returns false for non-string schemas", () => {
    const numberSchema = new NumberEnvVarSchema({
      process: numberProcessor,
      required: true,
    });
    expect(resolveShouldMask("NUM_SECRET", numberSchema, [/secret/i])).toBe(
      false,
    );
  });
});
