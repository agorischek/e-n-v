import { describe, expect, it } from "bun:test";
import { resolveShouldMask } from "../Session";
import type { EnvVarSchema } from "../../../../envcredible-types/src/specification";

const BASE_STRING_SCHEMA: EnvVarSchema = {
  type: "string",
  required: true,
};

describe("resolveShouldMask", () => {
  it("returns schema secret flag when provided", () => {
    const schema: EnvVarSchema = { ...BASE_STRING_SCHEMA, secret: true };
    expect(resolveShouldMask("API_KEY", schema, [])).toBe(true);

    const nonSecretSchema: EnvVarSchema = {
      ...BASE_STRING_SCHEMA,
      secret: false,
    };
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
    const numberSchema: EnvVarSchema = {
      type: "number",
      required: true,
    };
    expect(resolveShouldMask("NUM_SECRET", numberSchema, [/secret/i])).toBe(
      false,
    );
  });
});
