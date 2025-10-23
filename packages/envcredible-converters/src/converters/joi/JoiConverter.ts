import type {
  TypedEnvVarSchema,
  EnvVarType,
} from "@envcredible/core";
import {
  BooleanEnvVarSchema,
  NumberEnvVarSchema,
  StringEnvVarSchema,
  EnumEnvVarSchema,
} from "@envcredible/core";
import type { SchemaConverter } from "../SchemaConverter";
import type { JoiSchema } from "../../types";
import Joi from "joi";

/**
 * Extended description interface to include properties we need
 */
interface JoiDescription {
  type?: string;
  flags?: {
    description?: string;
    default?: unknown;
    presence?: "required" | "optional" | "forbidden";
    only?: boolean;
    [key: string]: any;
  };
  allow?: unknown[];
  [key: string]: any;
}

/**
 * Joi schema converter implementation
 */
export class JoiConverter implements SchemaConverter<JoiSchema> {
  applies(schema: unknown): schema is JoiSchema {
    return isJoiSchema(schema);
  }

  convert(schema: JoiSchema): TypedEnvVarSchema {
    return convertFromJoiSchema(schema);
  }
}

/**
 * Check if a schema is a Joi schema using the official API
 */
export function isJoiSchema(schema: unknown): schema is JoiSchema {
  return Joi.isSchema(schema);
}

/**
 * Get description from Joi schema using public API first, internal as fallback
 */
function getJoiDescription(schema: JoiSchema): string | undefined {
  try {
    const description = schema.describe() as JoiDescription;
    return description?.flags?.description;
  } catch {
    // Fallback to internal property if describe() fails
    return schema._flags?.description;
  }
}

/**
 * Check if schema is required using public API first, internal as fallback
 */
function isJoiRequired(schema: JoiSchema): boolean {
  try {
    const description = schema.describe() as JoiDescription;
    const presence = description?.flags?.presence;
    
    if (presence === "required") return true;
    if (presence === "optional") return false;
    
    // If no explicit presence flag, default to required (Joi's default behavior)
    return presence === undefined;
  } catch {
    // Fallback to internal properties if describe() fails
    const flags = schema._flags;
    if (flags?.presence === "required") return true;
    if (flags?.presence === "optional") return false;
    return true; // Default to required
  }
}

/**
 * Get default value from Joi schema using public API first, internal as fallback
 */
function getJoiDefaultValue(schema: JoiSchema): unknown {
  try {
    const description = schema.describe() as JoiDescription;
    const defaultValue = description?.flags?.default;
    return typeof defaultValue === "function" ? defaultValue() : defaultValue;
  } catch {
    // Fallback to internal properties if describe() fails
    const flags = schema._flags;
    if (flags?.default !== undefined) {
      const defaultValue = flags.default;
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }
    return undefined;
  }
}

/**
 * Get valid values for enum-like schemas using public API first, internal as fallback
 */
function getJoiValidValues(schema: JoiSchema): string[] | undefined {
  const values: unknown[] = [];
  let isOnlySchema = false;

  try {
    // Try public API first
    const description = schema.describe() as JoiDescription;
    if (description?.allow && Array.isArray(description.allow)) {
      values.push(...description.allow);
    }
    isOnlySchema = description?.flags?.only === true;
  } catch {
    // Fallback to internal properties
    if (schema._valids?._values) {
      values.push(...Array.from(schema._valids._values));
    }
    isOnlySchema = schema._flags?.only === true;
  }

  if (isOnlySchema && values.length > 0) {
    return values.map(v => String(v));
  }

  return undefined;
}

/**
 * Resolve environment variable type from Joi schema using public API first, internal as fallback
 */
function resolveJoiEnvVarType(schema: JoiSchema): EnvVarType {
  let type: string | undefined;

  try {
    // Try public API first
    const description = schema.describe() as JoiDescription;
    type = description?.type;
  } catch {
    // Fallback to internal properties
    type = schema._type || schema.type;
  }

  // Check for enum-like behavior
  const validValues = getJoiValidValues(schema);
  if (validValues && validValues.length > 0) {
    return "enum";
  }

  switch (type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "string"; // Default to string for unknown types
  }
}

/**
 * Create a process function for Joi schemas
 */
function createJoiProcessFunction<T>(
  schema: JoiSchema,
  type: EnvVarType
): (value: string) => T | undefined {
  return (value: string): T | undefined => {
    try {
      let processValue: unknown = value;

      // Pre-process based on expected type
      if (type === "number") {
        const num = Number(value);
        if (Number.isNaN(num)) {
          throw new Error(`Expected number, received "${value}"`);
        }
        processValue = num;
      } else if (type === "boolean") {
        // Custom boolean parsing for environment variables
        const lower = value.toLowerCase().trim();
        if (["true", "1", "yes", "on", "enabled"].includes(lower)) {
          processValue = true;
        } else if (["false", "0", "no", "off", "disabled"].includes(lower)) {
          processValue = false;
        } else {
          throw new Error(`Expected boolean value, received "${value}"`);
        }
      }

      // Validate with Joi
      const result = schema.validate(processValue, { convert: true });
      
      if (result.error) {
        const message = result.error.details
          ? result.error.details.map((d: any) => d.message).join("; ")
          : result.error.message || String(result.error);
        throw new Error(`Validation failed: ${message}`);
      }

      return result.value as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message);
    }
  };
}

/**
 * Convert Joi schema to TypedEnvVarSchema
 */
export function convertFromJoiSchema(schema: JoiSchema): TypedEnvVarSchema {
  const type = resolveJoiEnvVarType(schema);
  const required = isJoiRequired(schema);
  const defaultValue = getJoiDefaultValue(schema);
  const description = getJoiDescription(schema);

  switch (type) {
    case "boolean": {
      const process = createJoiProcessFunction<boolean>(schema, "boolean");
      return new BooleanEnvVarSchema({
        process,
        required,
        default: typeof defaultValue === "boolean" ? defaultValue : undefined,
        description,
      });
    }
    
    case "number": {
      const process = createJoiProcessFunction<number>(schema, "number");
      return new NumberEnvVarSchema({
        process,
        required,
        default: typeof defaultValue === "number" ? defaultValue : undefined,
        description,
      });
    }
    
    case "enum": {
      const values = getJoiValidValues(schema) || [];
      const process = createJoiProcessFunction<string>(schema, "enum");
      return new EnumEnvVarSchema({
        process,
        values,
        required,
        default: typeof defaultValue === "string" ? defaultValue : undefined,
        description,
      });
    }
    
    case "string":
    default: {
      const process = createJoiProcessFunction<string>(schema, "string");
      const stringDefault = 
        typeof defaultValue === "string" || defaultValue === null
          ? (defaultValue as string | null | undefined)
          : undefined;
          
      return new StringEnvVarSchema({
        process,
        required,
        default: stringDefault,
        description,
      });
    }
  }
}