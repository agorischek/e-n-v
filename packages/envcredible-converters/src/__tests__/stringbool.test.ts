import { z } from "zod";
import { describe, test, expect } from "bun:test";
import { resolveSchema } from "../resolveSchema.js";

describe("stringbool support", () => {
  test("z.stringbool() is recognized as boolean type", () => {
    const schema = z.stringbool();
    const envVarSchema = resolveSchema(schema);
    
    expect(envVarSchema.type).toBe("boolean");
    expect(envVarSchema.constructor.name).toBe("BooleanEnvVarSchema");
  });

  test("z.stringbool() processes string values to booleans correctly", () => {
    const schema = z.stringbool();
    const envVarSchema = resolveSchema(schema);
    
    // Test truthy values
    expect(envVarSchema.process("true")).toBe(true);
    expect(envVarSchema.process("1")).toBe(true);
    expect(envVarSchema.process("yes")).toBe(true);
    
    // Test falsy values
    expect(envVarSchema.process("false")).toBe(false);
    expect(envVarSchema.process("0")).toBe(false);
    expect(envVarSchema.process("no")).toBe(false);
  });

  test("z.stringbool() processes values case-insensitively", () => {
    const schema = z.stringbool();
    const envVarSchema = resolveSchema(schema);
    
    expect(envVarSchema.process("TRUE")).toBe(true);
    expect(envVarSchema.process("True")).toBe(true);
    expect(envVarSchema.process("FALSE")).toBe(false);
    expect(envVarSchema.process("False")).toBe(false);
  });

  test("z.stringbool() throws for invalid boolean strings", () => {
    const schema = z.stringbool();
    const envVarSchema = resolveSchema(schema);
    
    expect(() => envVarSchema.process("invalid")).toThrow();
    expect(() => envVarSchema.process("maybe")).toThrow();
    expect(() => envVarSchema.process("")).toThrow();
  });
});