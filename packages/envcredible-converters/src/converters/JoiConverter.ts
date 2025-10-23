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
 * Joi schema interface
 */
interface JoiSchema {
  _type?: string;
  _flags?: {
    default?: unknown;
    description?: string;
    only?: boolean;
    presence?: "required" | "optional" | "forbidden";
    insensitive?: boolean;
  };
  _valids?: {
    _values?: Set<unknown>;
    _refs?: unknown[];
  };
  _invalids?: {
    _values?: Set<unknown>;
    _refs?: unknown[];
  };
  _rules?: Array<{
    name?: string;
    args?: any;
  }>;
  _preferences?: {
    convert?: boolean;
  };
  _ids?: {
    _byKey?: Map<string, unknown>;
    _byId?: Map<string, unknown>;
  };
  validate?: (value: unknown, options?: any) => { error?: any; value?: unknown };
  describe?: () => JoiDescription;
}

/**
 * Joi description interface
 */
interface JoiDescription {
  type?: string;
  flags?: {
    default?: unknown;
    description?: string;
    only?: boolean;
    presence?: "required" | "optional" | "forbidden";
  };
  allow?: unknown[];
  invalid?: unknown[];
  rules?: Array<{
    name?: string;
    args?: any;
  }>;
}

/**
 * Check if a schema is a Joi schema
 */
export function isJoiSchema(schema: unknown): schema is JoiSchema {
  if (!schema || typeof schema !== "object") return false;
  
  const candidate = schema as any;
  
  // Check for Joi-specific properties
  return Boolean(
    candidate.isJoi === true || // Joi v17+
    (candidate._type && typeof candidate.validate === "function") || // Earlier versions
    (candidate.$_terms && typeof candidate.validate === "function") // Alternative check
  );
}

/**
 * Get description from Joi schema
 */
function getJoiDescription(schema: JoiSchema): string | undefined {
  // Try flags first
  if (schema._flags?.description) {
    return schema._flags.description;
  }

  // Try description method
  try {
    const description = schema.describe?.();
    if (description?.flags?.description) {
      return description.flags.description;
    }
  } catch {
    // Ignore errors from describe method
  }

  return undefined;
}

/**
 * Check if schema is required
 */
function isJoiRequired(schema: JoiSchema): boolean {
  // Check flags first
  if (schema._flags?.presence === "required") {
    return true;
  }
  if (schema._flags?.presence === "optional") {
    return false;
  }

  // Try description method
  try {
    const description = schema.describe?.();
    if (description?.flags?.presence === "required") {
      return true;
    }
    if (description?.flags?.presence === "optional") {
      return false;
    }
  } catch {
    // Ignore errors
  }

  // Default to required if no explicit presence flag
  return true;
}

/**
 * Get default value from Joi schema
 */
function getJoiDefaultValue(schema: JoiSchema): unknown {
  // Try flags first
  if (schema._flags?.default !== undefined) {
    const defaultValue = schema._flags.default;
    return typeof defaultValue === "function" ? defaultValue() : defaultValue;
  }

  // Try description method
  try {
    const description = schema.describe?.();
    if (description?.flags?.default !== undefined) {
      const defaultValue = description.flags.default;
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }
  } catch {
    // Ignore errors
  }

  return undefined;
}

/**
 * Get valid values for enum-like schemas
 */
function getJoiValidValues(schema: JoiSchema): string[] | undefined {
  const values: unknown[] = [];

  // Try _valids first
  if (schema._valids?._values) {
    values.push(...Array.from(schema._valids._values));
  }

  // Try description method
  try {
    const description = schema.describe?.();
    if (description?.allow && Array.isArray(description.allow)) {
      values.push(...description.allow);
    }
  } catch {
    // Ignore errors
  }

  // Check if this is an only() schema (enum-like)
  const isOnlySchema = schema._flags?.only === true;
  
  if (isOnlySchema && values.length > 0) {
    return values.map(v => String(v));
  }

  return undefined;
}

/**
 * Resolve environment variable type from Joi schema
 */
function resolveJoiEnvVarType(schema: JoiSchema): EnvVarType {
  // Get type from schema
  let type = schema._type;

  // Try description method if no direct type
  if (!type) {
    try {
      const description = schema.describe?.();
      type = description?.type;
    } catch {
      // Ignore errors
    }
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
      if (!schema.validate) {
        throw new Error("Schema does not have validate method");
      }

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