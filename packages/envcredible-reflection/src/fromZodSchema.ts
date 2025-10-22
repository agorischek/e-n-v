import type { CompatibleZodSchema } from "./zodCompat";
import { extractEnumValues, peelSchema, resolveEnvVarType, isZodV4Schema, getSchemaDef, getDefType } from "./zodCompat";
import type {
  TypedEnvVarSchema,
  EnvVarType,
} from "@envcredible/core";
import {
  BooleanEnvVarSchema as BooleanEnvVarSchemaClass,
  NumberEnvVarSchema as NumberEnvVarSchemaClass,
  StringEnvVarSchema as StringEnvVarSchemaClass,
  EnumEnvVarSchema as EnumEnvVarSchemaClass,
} from "@envcredible/core";
import { processFromSchema } from "./processFromSchema";
import { z } from "zod";
import * as z4core from "zod/v4/core";

/**
 * Creates a coerced version of a schema for number and boolean types
 * Environment variables are always strings, so we need coercion for these types
 */
function createCoercedSchema(type: EnvVarType, originalSchema: CompatibleZodSchema): CompatibleZodSchema | null {
  // Only create coerced schemas for types that need it
  if (type === "number") {
    return z.coerce.number();
  }
  if (type === "boolean") {
    // Check if the original schema is already a pipe (like stringbool) or stringbool type
    const def = getSchemaDef(originalSchema);
    const typeTag = getDefType(def);
    if (typeTag === "stringbool" || typeTag === "ZodStringBool" || typeTag === "pipe") {
      // Check if it's a string-to-boolean pipe
      if (typeTag === "pipe") {
        const pipeData = def as { in?: CompatibleZodSchema; out?: CompatibleZodSchema };
        if (pipeData.in && pipeData.out) {
          const inType = resolveEnvVarType(pipeData.in);
          const outType = resolveEnvVarType(pipeData.out);
          if (inType === "string" && outType === "boolean") {
            return null; // Use original pipe schema (like z.stringbool())
          }
        }
      } else {
        return null; // Use original stringbool schema
      }
    }
    
    // For regular boolean schemas, use custom transform for environment variable boolean parsing
    // This is more appropriate than z.coerce.boolean() which uses JS truthiness
    return z.string().transform((val) => {
      const lower = val.toLowerCase().trim();
      if (lower === "true" || lower === "1" || lower === "yes") return true;
      if (lower === "false" || lower === "0" || lower === "no") return false;
      throw new Error(`Expected boolean value (true/false, 1/0, yes/no), received "${val}"`);
    });
  }
  
  // Return null for other types to use the original schema
  return null;
}

export function fromZodSchema(schema: CompatibleZodSchema): TypedEnvVarSchema {
  const peeled = peelSchema(schema);
  const type = resolveEnvVarType(peeled.schema);
  const values = extractEnumValues(peeled.schema);

  switch (type) {
    case "boolean": {
      // Use coerced schema for boolean to handle string-to-boolean conversion
      const coercedSchema = createCoercedSchema("boolean", schema) || schema;
      const process = processFromSchema<boolean>(coercedSchema, "boolean");
      
      return new BooleanEnvVarSchemaClass({
        process,
        required: peeled.required,
        default: typeof peeled.default === "boolean" ? peeled.default : undefined,
        description: peeled.description,
      });
    }
    case "number": {
      // Use coerced schema for number to handle string-to-number conversion
      const coercedSchema = createCoercedSchema("number", schema) || schema;
      const process = processFromSchema<number>(coercedSchema, "number");
      
      return new NumberEnvVarSchemaClass({
        process,
        required: peeled.required,
        default: typeof peeled.default === "number" ? peeled.default : undefined,
        description: peeled.description,
      });
    }
    case "enum": {
      const process = processFromSchema<string>(schema, "enum", values);
      const defaultValue = typeof peeled.default === "string" ? peeled.default : undefined;

      return new EnumEnvVarSchemaClass({
        process,
        values: values ?? [],
        required: peeled.required,
        default: defaultValue,
        description: peeled.description,
      });
    }
    case "string":
    default: {
      const process = processFromSchema<string>(schema, "string");
      const defaultValue =
        typeof peeled.default === "string" || peeled.default === null
          ? (peeled.default as string | null | undefined)
          : undefined;

      return new StringEnvVarSchemaClass({
        process,
        required: peeled.required,
        default: defaultValue,
        description: peeled.description,
      });
    }
  }
}