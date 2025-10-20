import { z } from "zod";
import { fromZodSchema } from "../fromZodSchema";
import { describe, it, expect } from "bun:test";
describe("fromZodSchema", () => {
  describe("Basic type resolution", () => {
    it("should resolve string type", () => {
      const spec = fromZodSchema(z.string());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(true);
      expect(spec.default).toBeUndefined();
    });

    it("should resolve number type", () => {
      const spec = fromZodSchema(z.number());
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(true);
      expect(spec.default).toBeUndefined();
    });

    it("should resolve boolean type", () => {
      const spec = fromZodSchema(z.boolean());
      expect(spec.type).toBe("boolean");
      expect(spec.required).toBe(true);
      expect(spec.default).toBeUndefined();
    });

    it("should resolve enum type", () => {
      const spec = fromZodSchema(z.enum(["dev", "prod", "test"]));
      expect(spec.type).toBe("enum");
      expect(spec.required).toBe(true);
      expect(spec.default).toBeUndefined();
    });

    it("should default unknown types to string", () => {
      const spec = fromZodSchema(z.object({ key: z.string() }));
      expect(spec.type).toBe("string");
    });
  });

  describe("Required handling", () => {
    it("should detect optional strings as not required", () => {
      const spec = fromZodSchema(z.string().optional());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
    });

    it("should detect optional numbers as not required", () => {
      const spec = fromZodSchema(z.number().optional());
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(false);
    });

    it("should detect optional booleans as not required", () => {
      const spec = fromZodSchema(z.boolean().optional());
      expect(spec.type).toBe("boolean");
      expect(spec.required).toBe(false);
    });

    it("should detect optional enums as not required", () => {
      const spec = fromZodSchema(z.enum(["a", "b"]).optional());
      expect(spec.type).toBe("enum");
      expect(spec.required).toBe(false);
    });
  });

  describe("Default value handling", () => {
    it("should extract string default values", () => {
      const spec = fromZodSchema(z.string().default("hello"));
      expect(spec.type).toBe("string");
      expect(spec.default).toBe("hello");
      expect(spec.required).toBe(true);
    });

    it("should extract number default values", () => {
      const spec = fromZodSchema(z.number().default(42));
      expect(spec.type).toBe("number");
      expect(spec.default).toBe(42);
    });

    it("should extract boolean default values", () => {
      const spec = fromZodSchema(z.boolean().default(true));
      expect(spec.type).toBe("boolean");
      expect(spec.default).toBe(true);
    });

    it("should extract enum default values", () => {
      const spec = fromZodSchema(z.enum(["dev", "prod"]).default("dev"));
      expect(spec.type).toBe("enum");
      expect(spec.default).toBe("dev");
    });

    it("should handle function default values", () => {
      const spec = fromZodSchema(z.string().default(() => "computed"));
      expect(spec.type).toBe("string");
      expect(spec.default).toBe("computed");
    });
  });

  describe("Complex nested schemas", () => {
    it("should handle optional with default", () => {
      const spec = fromZodSchema(z.string().default("hello").optional());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.default).toBe("hello");
    });

    it("should handle default with optional (reversed order)", () => {
      const spec = fromZodSchema(z.string().optional().default("hello"));
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.default).toBe("hello");
    });

    it("should handle nullable with optional", () => {
      const spec = fromZodSchema(z.string().nullable().optional());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.default).toBeUndefined();
    });

    it("should handle optional with nullable (reversed order)", () => {
      const spec = fromZodSchema(z.string().optional().nullable());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.default).toBeUndefined();
    });

    it("should handle all three: optional, nullable, and default", () => {
      const spec = fromZodSchema(
        z.string().default("test").nullable().optional(),
      );
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.default).toBe("test");
    });

    it("should handle complex nesting order", () => {
      const spec = fromZodSchema(z.number().optional().default(100).nullable());
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(false);
      expect(spec.default).toBe(100);
    });
  });

  describe("Description handling", () => {
    it("should extract description from base schema", () => {
      const spec = fromZodSchema(z.string().describe("A string value"));
      expect(spec.description).toBe("A string value");
    });

    it("should extract description from optional schema", () => {
      const spec = fromZodSchema(z.string().describe("A string").optional());
      expect(spec.description).toBe("A string");
      expect(spec.required).toBe(false);
    });

    it("should extract description from outer wrapper", () => {
      const spec = fromZodSchema(
        z.string().optional().describe("Optional string"),
      );
      expect(spec.description).toBe("Optional string");
      expect(spec.required).toBe(false);
    });

    it("should use first description found (outermost takes precedence)", () => {
      const spec = fromZodSchema(
        z
          .string()
          .describe("Inner description")
          .optional()
          .describe("Outer description"),
      );
      expect(spec.description).toBe("Outer description");
    });

    it("should handle description with complex nesting", () => {
      const spec = fromZodSchema(
        z.string().describe("Base").default("test").nullable().optional(),
      );
      expect(spec.description).toBe("Base");
      expect(spec.default).toBe("test");
      expect(spec.required).toBe(false);
    });
  });

  describe("ZodEffects handling", () => {
    it("should unwrap through ZodEffects", () => {
      const schema = z.string().transform((val) => val.toUpperCase());
      const spec = fromZodSchema(schema);
      expect(spec.type).toBe("string");
    });

    it("should handle ZodEffects with other wrappers", () => {
      const schema = z
        .string()
        .min(3)
        .transform((val) => val.trim())
        .optional()
        .default("test");
      const spec = fromZodSchema(schema);
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.default).toBe("test");
    });

    it("should handle nested ZodEffects", () => {
      const schema = z
        .string()
        .transform((val) => val.toLowerCase())
        .transform((val) => val.trim())
        .optional();
      const spec = fromZodSchema(schema);
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle schemas with no constraints", () => {
      const spec = fromZodSchema(z.string());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(true);
      expect(spec.default).toBeUndefined();
      expect(spec.description).toBeUndefined();
    });

    it("should handle single value enum", () => {
      const spec = fromZodSchema(z.enum(["only"]));
      expect(spec.type).toBe("enum");
    });
  });
});
