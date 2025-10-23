import { describe, it, expect } from "bun:test";
import { resolveSchema } from "../resolve";
import { z } from "zod";

describe("Coercion for Environment Variables", () => {
  describe("Number coercion", () => {
    it("should coerce string numbers to numbers", () => {
      const schema = resolveSchema(z.number());
      
      // Environment variables are always strings, so test string input
      const result = schema.process("42");
      expect(result).toBe(42);
      expect(typeof result).toBe("number");
    });

    it("should coerce string decimals to numbers", () => {
      const schema = resolveSchema(z.number());
      
      const result = schema.process("3.14");
      expect(result).toBe(3.14);
      expect(typeof result).toBe("number");
    });

    it("should throw error for invalid number strings", () => {
      const schema = resolveSchema(z.number());
      
      expect(() => schema.process("not-a-number")).toThrow();
    });
  });

  describe("Boolean coercion", () => {
    it("should coerce 'true' string to boolean true", () => {
      const schema = resolveSchema(z.boolean());
      
      const result = schema.process("true");
      expect(result).toBe(true);
      expect(typeof result).toBe("boolean");
    });

    it("should coerce 'false' string to boolean false", () => {
      const schema = resolveSchema(z.boolean());
      
      const result = schema.process("false");
      expect(result).toBe(false);
      expect(typeof result).toBe("boolean");
    });

    it("should coerce '1' to boolean true", () => {
      const schema = resolveSchema(z.boolean());
      
      const result = schema.process("1");
      expect(result).toBe(true);
    });

    it("should coerce '0' to boolean false", () => {
      const schema = resolveSchema(z.boolean());
      
      const result = schema.process("0");
      expect(result).toBe(false);
    });

    it("should coerce 'yes' to boolean true", () => {
      const schema = resolveSchema(z.boolean());
      
      const result = schema.process("yes");
      expect(result).toBe(true);
    });

    it("should coerce 'no' to boolean false", () => {
      const schema = resolveSchema(z.boolean());
      
      const result = schema.process("no");
      expect(result).toBe(false);
    });

    it("should handle case insensitive values", () => {
      const schema = resolveSchema(z.boolean());
      
      expect(schema.process("TRUE")).toBe(true);
      expect(schema.process("False")).toBe(false);
      expect(schema.process("YES")).toBe(true);
      expect(schema.process("No")).toBe(false);
    });

    it("should throw error for invalid boolean strings", () => {
      const schema = resolveSchema(z.boolean());
      
      expect(() => schema.process("maybe")).toThrow('Invalid option: expected one of "true"|"1"|"yes"|"on"|"y"|"enabled"|"false"|"0"|"no"|"off"|"n"|"disabled"');
    });
  });

  describe("String schemas should not be coerced", () => {
    it("should keep strings as strings", () => {
      const schema = resolveSchema(z.string());
      
      const result = schema.process("hello");
      expect(result).toBe("hello");
      expect(typeof result).toBe("string");
    });
  });
});