import { describe, it, expect } from "bun:test";
import { envalidConverter, convertFromEnvalidValidator } from "../EnvalidConverter";
import type { 
  StringEnvVarSchema, 
  NumberEnvVarSchema, 
  BooleanEnvVarSchema, 
  EnumEnvVarSchema 
} from "@envcredible/core";

// Mock Envalid validators based on the library's structure
const createMockValidator = <T>(
  parseFn: (input: string) => T,
  options: {
    choices?: readonly T[];
    default?: T;
    devDefault?: T;
    desc?: string;
    example?: string;
    docs?: string;
  } = {}
) => ({
  _parse: parseFn,
  ...options,
});

// Mock implementations of Envalid's built-in validators
const str = (options: any = {}) => createMockValidator(
  (input: string) => {
    if (typeof input === "string") return input;
    throw new Error(`Not a string: "${input}"`);
  },
  options
);

const num = (options: any = {}) => createMockValidator(
  (input: string) => {
    const coerced = parseFloat(input);
    if (Number.isNaN(coerced)) throw new Error(`Invalid number input: "${input}"`);
    return coerced;
  },
  options
);

const bool = (options: any = {}) => createMockValidator(
  (input: string | boolean) => {
    switch (input) {
      case true:
      case 'true':
      case 't':
      case 'yes':
      case 'on':
      case '1':
        return true;
      case false:
      case 'false':
      case 'f':
      case 'no':
      case 'off':
      case '0':
        return false;
      default:
        throw new Error(`Invalid bool input: "${input}"`);
    }
  },
  options
);

const email = (options: any = {}) => createMockValidator(
  (input: string) => {
    const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (EMAIL_REGEX.test(input)) return input;
    throw new Error(`Invalid email address: "${input}"`);
  },
  options
);

describe("EnvalidConverter", () => {
  describe("applies", () => {
    it("should return true for valid Envalid validators", () => {
      const validator = str();
      expect(envalidConverter.applies(validator)).toBe(true);
    });

    it("should return false for non-validator objects", () => {
      expect(envalidConverter.applies({})).toBe(false);
      expect(envalidConverter.applies(null)).toBe(false);
      expect(envalidConverter.applies("string")).toBe(false);
      expect(envalidConverter.applies({ notParse: () => {} })).toBe(false);
    });
  });

  describe("string validator conversion", () => {
    it("should convert basic string validator", () => {
      const validator = str();
      const schema = envalidConverter.convert(validator) as StringEnvVarSchema;
      
      expect(schema.type).toBe("string");
      expect(schema.required).toBe(true);
      expect(schema.default).toBe(undefined);
      
      // Test processing
      expect(schema.process("hello")).toBe("hello");
    });

    it("should convert string validator with default", () => {
      const validator = str({ default: "default-value" });
      const schema = envalidConverter.convert(validator) as StringEnvVarSchema;
      
      expect(schema.type).toBe("string");
      expect(schema.required).toBe(false);
      expect(schema.default).toBe("default-value");
    });

    it("should convert string validator with description", () => {
      const validator = str({ desc: "A test string" });
      const schema = envalidConverter.convert(validator) as StringEnvVarSchema;
      
      expect(schema.description).toBe("A test string");
    });

    it("should prefer devDefault in non-production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      
      try {
        const validator = str({ 
          default: "prod-default", 
          devDefault: "dev-default" 
        });
        const schema = envalidConverter.convert(validator) as StringEnvVarSchema;
        
        expect(schema.default).toBe("dev-default");
        expect(schema.required).toBe(false);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("number validator conversion", () => {
    it("should convert basic number validator", () => {
      const validator = num();
      const schema = envalidConverter.convert(validator) as NumberEnvVarSchema;
      
      expect(schema.type).toBe("number");
      expect(schema.required).toBe(true);
      
      // Test processing
      expect(schema.process("42")).toBe(42);
      expect(schema.process("3.14")).toBe(3.14);
    });

    it("should convert number validator with default", () => {
      const validator = num({ default: 100 });
      const schema = envalidConverter.convert(validator) as NumberEnvVarSchema;
      
      expect(schema.default).toBe(100);
      expect(schema.required).toBe(false);
    });

    it("should throw on invalid number", () => {
      const validator = num();
      const schema = envalidConverter.convert(validator) as NumberEnvVarSchema;
      
      expect(() => schema.process("not-a-number")).toThrow();
    });
  });

  describe("boolean validator conversion", () => {
    it("should convert basic boolean validator", () => {
      const validator = bool();
      const schema = envalidConverter.convert(validator) as BooleanEnvVarSchema;
      
      expect(schema.type).toBe("boolean");
      expect(schema.required).toBe(true);
      
      // Test processing various boolean values
      expect(schema.process("true")).toBe(true);
      expect(schema.process("false")).toBe(false);
      expect(schema.process("1")).toBe(true);
      expect(schema.process("0")).toBe(false);
      expect(schema.process("yes")).toBe(true);
      expect(schema.process("no")).toBe(false);
    });

    it("should convert boolean validator with default", () => {
      const validator = bool({ default: true });
      const schema = envalidConverter.convert(validator) as BooleanEnvVarSchema;
      
      expect(schema.default).toBe(true);
      expect(schema.required).toBe(false);
    });
  });

  describe("enum validator conversion", () => {
    it("should convert validator with choices as enum", () => {
      const validator = str({ 
        choices: ["development", "test", "production"] as const 
      });
      const schema = envalidConverter.convert(validator) as EnumEnvVarSchema;
      
      expect(schema.type).toBe("enum");
      expect(schema.values).toEqual(["development", "test", "production"]);
      expect(schema.required).toBe(true);
      
      // Test processing
      expect(schema.process("production")).toBe("production");
    });

    it("should convert enum validator with default", () => {
      const validator = str({ 
        choices: ["development", "test", "production"] as const,
        default: "development"
      });
      const schema = envalidConverter.convert(validator) as EnumEnvVarSchema;
      
      expect(schema.default).toBe("development");
      expect(schema.required).toBe(false);
    });
  });

  describe("email validator conversion", () => {
    it("should convert email validator as string type", () => {
      const validator = email();
      const schema = envalidConverter.convert(validator) as StringEnvVarSchema;
      
      expect(schema.type).toBe("string");
      expect(schema.required).toBe(true);
      
      // Test processing
      expect(schema.process("test@example.com")).toBe("test@example.com");
    });

    it("should throw on invalid email", () => {
      const validator = email();
      const schema = envalidConverter.convert(validator) as StringEnvVarSchema;
      
      expect(() => schema.process("invalid-email")).toThrow();
    });
  });

  describe("error handling", () => {
    it("should wrap validation errors appropriately", () => {
      const validator = num();
      const schema = envalidConverter.convert(validator) as NumberEnvVarSchema;
      
      expect(() => schema.process("not-a-number")).toThrow(/Envalid validation failed/);
    });
  });
});