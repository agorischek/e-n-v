import { describe, it, expect } from "bun:test";
import { resolveSchema } from "../resolveSchema";
import { StringEnvVarSchema } from "@envcredible/core";
import { z } from "zod";

describe("SchemaSource", () => {
  describe("resolveSchema", () => {
    it("should transform Zod schema to EnvVarSchema", () => {
      const zodSchema = z.string().describe("Test zod schema");
      
      const result = resolveSchema(zodSchema);
      expect(result.type).toBe("string");
      expect(result.description).toBe("Test zod schema");
    });

    it("should handle different schema types", () => {
      const stringSchema = z.string();
      const numberSchema = z.number();
      const booleanSchema = z.boolean();
      
      const stringResult = resolveSchema(stringSchema);
      const numberResult = resolveSchema(numberSchema);
      const booleanResult = resolveSchema(booleanSchema);
      
      expect(stringResult.type).toBe("string");
      expect(numberResult.type).toBe("number");
      expect(booleanResult.type).toBe("boolean");
    });
  });
});