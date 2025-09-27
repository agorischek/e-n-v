import { z } from "zod";
import { EnvVarSpec } from "../EnvVarSpec";
import { describe, it, expect } from "bun:test";

describe("EnvVarSpec", () => {
  describe("Basic type resolution", () => {
    it("should resolve string type", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(false);
      expect(spec.defaultValue).toBeUndefined();
    });

    it("should resolve number type", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number());
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(false);
      expect(spec.defaultValue).toBeUndefined();
    });

    it("should resolve boolean type", () => {
      const spec = EnvVarSpec.FromZodSchema(z.boolean());
      expect(spec.type).toBe("boolean");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(false);
      expect(spec.defaultValue).toBeUndefined();
    });

    it("should resolve enum type", () => {
      const spec = EnvVarSpec.FromZodSchema(z.enum(["dev", "prod", "test"]));
      expect(spec.type).toBe("enum");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(false);
      expect(spec.defaultValue).toBeUndefined();
    });

    it("should default unknown types to string", () => {
      const spec = EnvVarSpec.FromZodSchema(z.object({ key: z.string() }));
      expect(spec.type).toBe("string");
    });
  });

  describe("Required handling", () => {
    it("should detect optional strings as not required", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().optional());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(false);
    });

    it("should detect optional numbers as not required", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number().optional());
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(false);
    });

    it("should detect optional booleans as not required", () => {
      const spec = EnvVarSpec.FromZodSchema(z.boolean().optional());
      expect(spec.type).toBe("boolean");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(false);
    });

    it("should detect optional enums as not required", () => {
      const spec = EnvVarSpec.FromZodSchema(z.enum(["a", "b"]).optional());
      expect(spec.type).toBe("enum");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(false);
    });
  });

  describe("Nullable handling", () => {
    it("should detect nullable strings", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().nullable());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(true);
    });

    it("should detect nullable numbers", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number().nullable());
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(true);
    });
  });

  describe("Default value handling", () => {
    it("should extract string default values", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().default("hello"));
      expect(spec.type).toBe("string");
      expect(spec.defaultValue).toBe("hello");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(false);
    });

    it("should extract number default values", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number().default(42));
      expect(spec.type).toBe("number");
      expect(spec.defaultValue).toBe(42);
    });

    it("should extract boolean default values", () => {
      const spec = EnvVarSpec.FromZodSchema(z.boolean().default(true));
      expect(spec.type).toBe("boolean");
      expect(spec.defaultValue).toBe(true);
    });

    it("should extract enum default values", () => {
      const spec = EnvVarSpec.FromZodSchema(z.enum(["dev", "prod"]).default("dev"));
      expect(spec.type).toBe("enum");
      expect(spec.defaultValue).toBe("dev");
    });

    it("should handle function default values", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().default(() => "computed"));
      expect(spec.type).toBe("string");
      expect(spec.defaultValue).toBe("computed");
    });
  });

  describe("Complex nested schemas", () => {
    it("should handle optional with default", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().default("hello").optional());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.defaultValue).toBe("hello");
      expect(spec.nullable).toBe(false);
    });

    it("should handle default with optional (reversed order)", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().optional().default("hello"));
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.defaultValue).toBe("hello");
      expect(spec.nullable).toBe(false);
    });

    it("should handle nullable with optional", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().nullable().optional());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(true);
      expect(spec.defaultValue).toBeUndefined();
    });

    it("should handle optional with nullable (reversed order)", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().optional().nullable());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(true);
      expect(spec.defaultValue).toBeUndefined();
    });

    it("should handle all three: optional, nullable, and default", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z.string().default("test").nullable().optional()
      );
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(true);
      expect(spec.defaultValue).toBe("test");
    });

    it("should handle complex nesting order", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z.number().optional().default(100).nullable()
      );
      expect(spec.type).toBe("number");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(true);
      expect(spec.defaultValue).toBe(100);
    });
  });

  describe("Description handling", () => {
    it("should extract description from base schema", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().describe("A string value"));
      expect(spec.description).toBe("A string value");
    });

    it("should extract description from optional schema", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().describe("A string").optional());
      expect(spec.description).toBe("A string");
      expect(spec.required).toBe(false);
    });

    it("should extract description from outer wrapper", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z.string().optional().describe("Optional string")
      );
      expect(spec.description).toBe("Optional string");
      expect(spec.required).toBe(false);
    });

    it("should use first description found (outermost takes precedence)", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z
          .string()
          .describe("Inner description")
          .optional()
          .describe("Outer description")
      );
      expect(spec.description).toBe("Outer description");
    });

    it("should handle description with complex nesting", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z.string().describe("Base").default("test").nullable().optional()
      );
      expect(spec.description).toBe("Base");
      expect(spec.defaultValue).toBe("test");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(true);
    });
  });

  describe("String constraints", () => {
    it("should extract min length", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().min(5));
      expect(spec.type).toBe("string");
      expect(spec.min).toBe(5);
      expect(spec.max).toBeUndefined();
    });

    it("should extract max length", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().max(10));
      expect(spec.type).toBe("string");
      expect(spec.min).toBeUndefined();
      expect(spec.max).toBe(10);
    });

    it("should extract both min and max length", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string().min(3).max(15));
      expect(spec.type).toBe("string");
      expect(spec.min).toBe(3);
      expect(spec.max).toBe(15);
    });

    it("should handle min/max with other wrappers", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z.string().min(2).max(8).optional().default("test")
      );
      expect(spec.type).toBe("string");
      expect(spec.min).toBe(2);
      expect(spec.max).toBe(8);
      expect(spec.required).toBe(false);
      expect(spec.defaultValue).toBe("test");
    });
  });

  describe("Number constraints", () => {
    it("should extract min value", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number().min(0));
      expect(spec.type).toBe("number");
      expect(spec.min).toBe(0);
      expect(spec.max).toBeUndefined();
    });

    it("should extract max value", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number().max(100));
      expect(spec.type).toBe("number");
      expect(spec.min).toBeUndefined();
      expect(spec.max).toBe(100);
    });

    it("should extract both min and max values", () => {
      const spec = EnvVarSpec.FromZodSchema(z.number().min(-10).max(50));
      expect(spec.type).toBe("number");
      expect(spec.min).toBe(-10);
      expect(spec.max).toBe(50);
    });

    it("should handle min/max with other wrappers", () => {
      const spec = EnvVarSpec.FromZodSchema(
        z.number().min(1).max(999).nullable().default(42)
      );
      expect(spec.type).toBe("number");
      expect(spec.min).toBe(1);
      expect(spec.max).toBe(999);
      expect(spec.nullable).toBe(true);
      expect(spec.defaultValue).toBe(42);
    });
  });

  describe("ZodEffects handling", () => {
    it("should unwrap through ZodEffects", () => {
      const schema = z.string().transform((val) => val.toUpperCase());
      const spec = EnvVarSpec.FromZodSchema(schema);
      expect(spec.type).toBe("string");
    });

    it("should handle ZodEffects with other wrappers", () => {
      const schema = z
        .string()
        .min(3)
        .transform((val) => val.trim())
        .optional()
        .default("test");
      const spec = EnvVarSpec.FromZodSchema(schema);
      expect(spec.type).toBe("string");
      expect(spec.min).toBe(3);
      expect(spec.required).toBe(false);
      expect(spec.defaultValue).toBe("test");
    });

    it("should handle nested ZodEffects", () => {
      const schema = z
        .string()
        .transform((val) => val.toLowerCase())
        .transform((val) => val.trim())
        .optional();
      const spec = EnvVarSpec.FromZodSchema(schema);
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle schemas with no constraints", () => {
      const spec = EnvVarSpec.FromZodSchema(z.string());
      expect(spec.type).toBe("string");
      expect(spec.required).toBe(true);
      expect(spec.nullable).toBe(false);
      expect(spec.defaultValue).toBeUndefined();
      expect(spec.min).toBeUndefined();
      expect(spec.max).toBeUndefined();
      expect(spec.description).toBeUndefined();
    });

    it("should handle single value enum", () => {
      const spec = EnvVarSpec.FromZodSchema(z.enum(["only"]));
      expect(spec.type).toBe("enum");
    });

    it("should handle deeply nested wrappers", () => {
      const schema = z
        .string()
        .describe("Deep")
        .min(1)
        .max(100)
        .default("deep")
        .optional()
        .nullable()
        .optional() // Double optional (shouldn't break)
        .nullable(); // Double nullable (shouldn't break)

      const spec = EnvVarSpec.FromZodSchema(schema);
      expect(spec.type).toBe("string");
      expect(spec.description).toBe("Deep");
      expect(spec.min).toBe(1);
      expect(spec.max).toBe(100);
      expect(spec.defaultValue).toBe("deep");
      expect(spec.required).toBe(false);
      expect(spec.nullable).toBe(true);
    });
  });
});
