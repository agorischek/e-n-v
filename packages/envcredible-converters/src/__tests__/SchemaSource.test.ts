import { describe, it, expect } from "bun:test";
import { fromZodSchema } from "../fromZodSchema";
import { StringEnvVarSchema } from "@envcredible/core";
import { z } from "zod";

describe("SchemaSource", () => {
  describe("fromZodSchema", () => {
    it("should transform Zod schema to EnvVarSchema", () => {
      const zodSchema = z.string().describe("Test zod schema");
      
      const result = fromZodSchema(zodSchema);
      expect(result.type).toBe("string");
      expect(result.description).toBe("Test zod schema");
    });

    it("should handle different schema types", () => {
      const stringSchema = z.string();
      const numberSchema = z.number();
      const booleanSchema = z.boolean();
      
      const stringResult = fromZodSchema(stringSchema);
      const numberResult = fromZodSchema(numberSchema);
      const booleanResult = fromZodSchema(booleanSchema);
      
      expect(stringResult.type).toBe("string");
      expect(numberResult.type).toBe("number");
      expect(booleanResult.type).toBe("boolean");
    });
  });
});