import { describe, it, expect } from "bun:test";
import { resolveSchema } from "../index";
import Joi from "joi";

describe("JoiConverter", () => {
  it("should resolve Joi string schemas", () => {
    const joiSchema = Joi.string();
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(true);
  });

  it("should resolve Joi optional string schemas", () => {
    const joiSchema = Joi.string().optional();
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(false);
  });

  it("should resolve Joi number schemas", () => {
    const joiSchema = Joi.number();
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("number");
    expect(envSchema.required).toBe(true);
  });

  it("should resolve Joi boolean schemas", () => {
    const joiSchema = Joi.boolean();
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("boolean");
    expect(envSchema.required).toBe(true);
  });

  it("should resolve Joi enum schemas", () => {
    const joiSchema = Joi.string().valid("dev", "prod", "test");
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("enum");
    expect(envSchema.required).toBe(true);
  });

  it("should handle Joi schemas with default values", () => {
    const joiSchema = Joi.string().default("default-value");
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("string");
    expect(envSchema.required).toBe(true); // Joi with default is still considered required
    expect(envSchema.default).toBe("default-value");
  });

  it("should handle Joi schemas with descriptions", () => {
    const joiSchema = Joi.string().description("A test string");
    const envSchema = resolveSchema(joiSchema);

    expect(envSchema).toBeDefined();
    expect(envSchema.type).toBe("string");
    expect(envSchema.description).toBe("A test string");
  });

  it("should process string values correctly", () => {
    const joiSchema = Joi.string().min(3);
    const envSchema = resolveSchema(joiSchema);
    
    const result = envSchema.process("hello");
    expect(result).toBe("hello");
  });

  it("should process number values correctly", () => {
    const joiSchema = Joi.number().min(0);
    const envSchema = resolveSchema(joiSchema);
    
    const result = envSchema.process("42");
    expect(result).toBe(42);
  });

  it("should process boolean values correctly", () => {
    const joiSchema = Joi.boolean();
    const envSchema = resolveSchema(joiSchema);
    
    expect(envSchema.process("true")).toBe(true);
    expect(envSchema.process("false")).toBe(false);
    expect(envSchema.process("1")).toBe(true);
    expect(envSchema.process("0")).toBe(false);
    expect(envSchema.process("yes")).toBe(true);
    expect(envSchema.process("no")).toBe(false);
  });

  it("should process enum values correctly", () => {
    const joiSchema = Joi.string().valid("dev", "prod", "test");
    const envSchema = resolveSchema(joiSchema);
    
    const result = envSchema.process("dev");
    expect(result).toBe("dev");
  });

  it("should throw error for invalid values", () => {
    const joiSchema = Joi.number().min(10);
    const envSchema = resolveSchema(joiSchema);
    
    expect(() => envSchema.process("5")).toThrow();
  });

  it("should throw error for invalid enum values", () => {
    const joiSchema = Joi.string().valid("dev", "prod", "test");
    const envSchema = resolveSchema(joiSchema);
    
    expect(() => envSchema.process("invalid")).toThrow();
  });

  it("should throw error for invalid boolean values", () => {
    const joiSchema = Joi.boolean();
    const envSchema = resolveSchema(joiSchema);
    
    expect(() => envSchema.process("maybe")).toThrow();
  });
});