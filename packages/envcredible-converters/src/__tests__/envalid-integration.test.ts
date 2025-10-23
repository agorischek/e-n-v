import { describe, it, expect } from "bun:test";
import { resolveSchema } from "../resolveSchema";

// Mock Envalid validator structure for integration testing
const createEnvalidValidator = <T>(
  parseFn: (input: string) => T,
  options: {
    choices?: readonly T[];
    default?: T;
    devDefault?: T;
    desc?: string;
  } = {}
) => ({
  _parse: parseFn,
  ...options,
});

describe("Envalid Integration with resolveSchema", () => {
  it("should resolve Envalid string validator through main API", () => {
    const validator = createEnvalidValidator(
      (input: string) => {
        if (typeof input === "string") return input;
        throw new Error(`Not a string: "${input}"`);
      },
      { desc: "Test string validator" }
    );

    const schema = resolveSchema(validator);
    
    expect(schema.type).toBe("string");
    expect(schema.required).toBe(true);
    expect(schema.description).toBe("Test string validator");
    expect(schema.process("test")).toBe("test");
  });

  it("should resolve Envalid number validator through main API", () => {
    const validator = createEnvalidValidator(
      (input: string) => {
        const coerced = parseFloat(input);
        if (Number.isNaN(coerced)) throw new Error(`Invalid number input: "${input}"`);
        return coerced;
      },
      { default: 42 }
    );

    const schema = resolveSchema(validator);
    
    expect(schema.type).toBe("number");
    expect(schema.required).toBe(false);
    expect(schema.default).toBe(42);
    expect(schema.process("123")).toBe(123);
  });

  it("should resolve Envalid boolean validator through main API", () => {
    const validator = createEnvalidValidator(
      (input: string | boolean) => {
        switch (input) {
          case true:
          case 'true':
          case '1':
            return true;
          case false:
          case 'false':
          case '0':
            return false;
          default:
            throw new Error(`Invalid bool input: "${input}"`);
        }
      },
      { default: false }
    );

    const schema = resolveSchema(validator);
    
    expect(schema.type).toBe("boolean");
    expect(schema.required).toBe(false);
    expect(schema.default).toBe(false);
    expect(schema.process("true")).toBe(true);
    expect(schema.process("false")).toBe(false);
  });

  it("should resolve Envalid enum validator through main API", () => {
    const validator = createEnvalidValidator(
      (input: string) => {
        const choices = ["development", "test", "production"];
        if (choices.includes(input)) return input;
        throw new Error(`Invalid choice: "${input}"`);
      },
      { 
        choices: ["development", "test", "production"] as const,
        default: "development"
      }
    );

    const schema = resolveSchema(validator);
    
    expect(schema.type).toBe("enum");
    expect(schema.required).toBe(false);
    expect(schema.default).toBe("development");
    expect((schema as any).values).toEqual(["development", "test", "production"]);
    expect(schema.process("production")).toBe("production");
  });

  it("should throw for unsupported schemas (maintaining existing behavior)", () => {
    const unsupportedSchema = { notAValidator: true };
    
    expect(() => resolveSchema(unsupportedSchema)).toThrow(
      /No converter found for schema. Supported types: Zod v3, Zod v4, Envalid/
    );
  });
});