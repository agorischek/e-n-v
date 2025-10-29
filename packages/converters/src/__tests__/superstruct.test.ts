import { describe, it, expect } from "bun:test";
import type { EnumEnvVarSchema } from "@e-n-v/core";
import {
  string,
  number,
  boolean as ssBoolean,
  optional,
  enums,
  integer,
  literal,
  refine,
} from "superstruct";
import { resolveSchema } from "@e-n-v/models";

describe("SuperstructConverter", () => {
  it("should resolve string structs", () => {
    const struct = string();
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(true);
    expect(envSchema.process("hello")).toBe("hello");
  });

  it("should resolve optional strings as not required", () => {
    const struct = optional(string());
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(false);
    expect(envSchema.process("")).toBeUndefined();
  });

  it("should resolve number structs", () => {
    const struct = number();
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("number");
    expect(envSchema.required).toBe(true);
    expect(envSchema.process("42")).toBe(42);
    expect(() => envSchema.process("abc")).toThrow();
  });

  it("should resolve integer structs", () => {
    const struct = integer();
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("number");
    expect(envSchema.process("10")).toBe(10);
    expect(() => envSchema.process("10.5")).toThrow();
  });

  it("should resolve boolean structs", () => {
    const struct = ssBoolean();
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("boolean");
    expect(envSchema.process("true")).toBe(true);
    expect(envSchema.process("false")).toBe(false);
    expect(() => envSchema.process("maybe")).toThrow();
  });

  it("should resolve enum structs", () => {
    const struct = enums(["dev", "prod", "test"] as const);
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("enum");
    const enumSchema = envSchema as EnumEnvVarSchema;
    expect(enumSchema.values).toEqual(["dev", "prod", "test"]);
    expect(envSchema.process("dev")).toBe("dev");
    expect(() => envSchema.process("staging")).toThrow();
  });

  it("should treat refined strings as string type", () => {
    const struct = refine(
      string(),
      "uppercase",
      (value: string) =>
        value === value.toUpperCase() ||
        `Expected uppercase string, received "${value}"`,
    );
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("string");
    expect(envSchema.process("HELLO")).toBe("HELLO");
    expect(() => envSchema.process("hello")).toThrow();
  });

  it("should resolve literal string structs as enums", () => {
    const struct = literal("production");
    const envSchema = resolveSchema(struct);

    expect(envSchema.type).toBe("enum");
    const enumSchema = envSchema as EnumEnvVarSchema;
    expect(enumSchema.values).toEqual(["production"]);
    expect(envSchema.process("production")).toBe("production");
    expect(() => envSchema.process("staging")).toThrow();
  });
});
