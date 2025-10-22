import { describe, test, expect } from "bun:test";
import { z } from "zod";
import { fromZodSchema } from "@envcredible/converters";
import { applyCustomPreprocessing } from "../createPrompt.js";

describe("Custom preprocessing functionality", () => {
  describe("number preprocessing", () => {
    const numberSchema = fromZodSchema(z.number());
    
    test("applies custom number preprocessor", () => {
      const preprocessorOptions = {
        number: (value: string) => value.replace(/,/g, '')
      };
      
      const result = applyCustomPreprocessing("1,000", numberSchema, preprocessorOptions);
      expect(result).toBe(1000);
      expect(typeof result).toBe("number");
    });
    
    test("skips preprocessing when number preprocessor is null", () => {
      const preprocessorOptions = { number: null };
      
      // Should throw because "1,000" is not a valid number without preprocessing
      expect(() => applyCustomPreprocessing("1,000", numberSchema, preprocessorOptions)).toThrow();
    });
    
    test("skips preprocessing when number preprocessor is undefined", () => {
      const preprocessorOptions = { number: undefined };
      
      // With undefined preprocessor, default preprocessing should apply (removes commas)
      const result = applyCustomPreprocessing("1,000", numberSchema, preprocessorOptions);
      expect(result).toBe(1000);
    });
    
    test("works without preprocessor options", () => {
      const result = applyCustomPreprocessing("42", numberSchema, undefined);
      expect(result).toBe(42);
    });
    
    test("preprocessor can return target type directly", () => {
      const preprocessorOptions = {
        number: (value: string) => parseInt(value.replace(/,/g, ''), 10)
      };
      
      const result = applyCustomPreprocessing("1,000", numberSchema, preprocessorOptions);
      expect(result).toBe(1000);
      expect(typeof result).toBe("number");
    });
  });
  
  describe("boolean preprocessing", () => {
    const booleanSchema = fromZodSchema(z.boolean());
    
    test("applies custom boolean preprocessor", () => {
      const preprocessorOptions = {
        bool: (value: string) => {
          const lower = value.toLowerCase();
          if (lower === "on" || lower === "enabled") return "true";
          if (lower === "off" || lower === "disabled") return "false";
          return value;
        }
      };
      
      expect(applyCustomPreprocessing<boolean>("on", booleanSchema, preprocessorOptions)).toBe(true);
      expect(applyCustomPreprocessing<boolean>("enabled", booleanSchema, preprocessorOptions)).toBe(true);
      expect(applyCustomPreprocessing<boolean>("off", booleanSchema, preprocessorOptions)).toBe(false);
      expect(applyCustomPreprocessing<boolean>("disabled", booleanSchema, preprocessorOptions)).toBe(false);
      
      // Standard values should still work
      expect(applyCustomPreprocessing<boolean>("true", booleanSchema, preprocessorOptions)).toBe(true);
      expect(applyCustomPreprocessing<boolean>("false", booleanSchema, preprocessorOptions)).toBe(false);
    });
    
    test("preprocessor can return target type directly", () => {
      const preprocessorOptions = {
        bool: (value: string) => value.toLowerCase() === "on"
      };
      
      const result = applyCustomPreprocessing("on", booleanSchema, preprocessorOptions);
      expect(result).toBe(true);
      expect(typeof result).toBe("boolean");
    });
    
    test("skips preprocessing when bool preprocessor is null", () => {
      const preprocessorOptions = { bool: null };
      
      const result = applyCustomPreprocessing("true", booleanSchema, preprocessorOptions);
      expect(result).toBe(true);
    });
  });
  
  describe("string schemas", () => {
    const stringSchema = fromZodSchema(z.string());
    
    test("applies string preprocessing", () => {
      const preprocessorOptions = {
        string: (value: string) => value.trim().toLowerCase()
      };
      
      const result = applyCustomPreprocessing("  TEST  ", stringSchema, preprocessorOptions);
      expect(result).toBe("test");
    });
    
    test("does not apply number or bool preprocessing to string schemas", () => {
      const preprocessorOptions = {
        number: (value: string) => "should not be called",
        bool: (value: string) => "should not be called"
      };
      
      const result = applyCustomPreprocessing("test", stringSchema, preprocessorOptions);
      expect(result).toBe("test");
    });
  });
  
  describe("enum schemas", () => {
    const enumSchema = fromZodSchema(z.enum(["dev", "prod", "test"]));
    
    test("applies enum preprocessing", () => {
      const preprocessorOptions = {
        enum: (value: string) => value.toLowerCase()
      };
      
      const result = applyCustomPreprocessing("DEV", enumSchema, preprocessorOptions);
      expect(result).toBe("dev");
    });
    
    test("does not apply number or bool preprocessing to enum schemas", () => {
      const preprocessorOptions = {
        number: (value: string) => "should not be called",
        bool: (value: string) => "should not be called"
      };
      
      const result = applyCustomPreprocessing("dev", enumSchema, preprocessorOptions);
      expect(result).toBe("dev");
    });
  });
});