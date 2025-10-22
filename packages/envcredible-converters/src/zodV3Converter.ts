import type { ZodTypeAny } from "zod";
import { z } from "zod";
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

/**
 * Zod v3 schema definition
 */
interface ZodV3Def {
  typeName?: string;
  innerType?: ZodTypeAny;
  schema?: ZodTypeAny;
  defaultValue?: (() => unknown) | unknown;
  description?: string;
  values?: unknown[];
}

/**
 * Check if a schema is a Zod v3 schema
 */
export function isZodV3Schema(schema: unknown): schema is ZodTypeAny {
  if (!schema || typeof schema !== "object") return false;
  
  // Check for Zod v3 specific properties
  const candidate = schema as any;
  return Boolean(
    candidate._def && 
    !("_zod" in candidate) && // Not v4
    (candidate._def.typeName || typeof candidate.parse === "function")
  );
}

/**
 * Extract definition from Zod v3 schema
 */
function getV3Def(schema: ZodTypeAny): ZodV3Def {
  return (schema as any)._def || {};
}

/**
 * Get the type name from a Zod v3 definition
 */
function getV3TypeName(def: ZodV3Def): string {
  return def.typeName || "unknown";
}

/**
 * Check if a type is a wrapper type that should be unwrapped
 */
function isV3WrapperType(typeName: string): boolean {
  return [
    "ZodOptional",
    "ZodDefault", 
    "ZodEffects",
    "ZodNullable",
    "ZodNullish",
    "ZodReadonly",
    "ZodBranded",
    "ZodCatch"
  ].includes(typeName);
}

/**
 * Get inner schema from wrapper
 */
function getV3InnerSchema(def: ZodV3Def): ZodTypeAny | undefined {
  return def.innerType || def.schema;
}

/**
 * Get default value from definition
 */
function getV3DefaultValue(def: ZodV3Def): unknown {
  if (def.defaultValue === undefined) return undefined;
  return typeof def.defaultValue === "function" 
    ? def.defaultValue() 
    : def.defaultValue;
}

/**
 * Extract enum values from schema
 */
function extractV3EnumValues(def: ZodV3Def): string[] | undefined {
  if (!Array.isArray(def.values)) return undefined;
  return def.values.map(v => String(v));
}

/**
 * Get description from schema
 */
function getV3Description(schema: ZodTypeAny, def: ZodV3Def): string | undefined {
  const directDesc = (schema as any).description;
  if (typeof directDesc === "string" && directDesc.length > 0) {
    return directDesc;
  }
  
  if (typeof def.description === "string" && def.description.length > 0) {
    return def.description;
  }
  
  return undefined;
}

/**
 * Resolve environment variable type from schema
 */
function resolveV3EnvVarType(schema: ZodTypeAny): EnvVarType {
  const def = getV3Def(schema);
  const typeName = getV3TypeName(def);
  
  switch (typeName) {
    case "ZodString":
      return "string";
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "boolean";
    case "ZodEnum":
      return "enum";
    default:
      if (def.values) return "enum";
      return "string";
  }
}

/**
 * Peel wrapper types from schema
 */
interface V3PeeledResult {
  schema: ZodTypeAny;
  required: boolean;
  default: unknown;
  description?: string;
}

function peelV3Schema(schema: ZodTypeAny): V3PeeledResult {
  let current = schema;
  let required = true;
  let defaultValue: unknown = undefined;
  let description: string | undefined = undefined;

  // Unwrap wrapper types (max 20 iterations to prevent infinite loops)
  for (let i = 0; i < 20; i++) {
    const def = getV3Def(current);
    const typeName = getV3TypeName(def);

    if (!description) {
      description = getV3Description(current, def);
    }

    if (!isV3WrapperType(typeName)) {
      break;
    }

    if (typeName === "ZodOptional" || typeName === "ZodNullish") {
      required = false;
    }

    if (typeName === "ZodDefault" && defaultValue === undefined) {
      defaultValue = getV3DefaultValue(def);
    }

    const inner = getV3InnerSchema(def);
    if (!inner) break;
    
    current = inner;
  }

  return {
    schema: current,
    required,
    default: defaultValue,
    description,
  };
}

/**
 * Create a process function for Zod v3 schemas
 */
function createV3ProcessFunction<T>(
  schema: ZodTypeAny,
  type: EnvVarType
): (value: string) => T | undefined {
  return (value: string): T | undefined => {
    try {
      // For numbers and booleans, we need to handle string-to-type conversion
      let processSchema = schema;
      
      if (type === "number") {
        processSchema = z.coerce.number();
      } else if (type === "boolean") {
        // Custom boolean parsing for environment variables
        processSchema = z.string().transform((val) => {
          const lower = val.toLowerCase().trim();
          if (["true", "1", "yes", "on", "enabled"].includes(lower)) return true;
          if (["false", "0", "no", "off", "disabled"].includes(lower)) return false;
          throw new Error(`Expected boolean value, received "${val}"`);
        });
      }

      const result = processSchema.safeParse(value);
      if (result.success) {
        return result.data as T;
      }
      
      throw new Error(
        `Failed to parse value "${value}": ${result.error.issues
          .map(issue => issue.message)
          .join("; ")}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message);
    }
  };
}

/**
 * Convert Zod v3 schema to EnvVarSchema
 */
export function convertFromZodV3Schema(schema: ZodTypeAny): TypedEnvVarSchema {
  const peeled = peelV3Schema(schema);
  const type = resolveV3EnvVarType(peeled.schema);
  const def = getV3Def(peeled.schema);

  switch (type) {
    case "boolean": {
      const process = createV3ProcessFunction<boolean>(peeled.schema, "boolean");
      return new BooleanEnvVarSchema({
        process,
        required: peeled.required,
        default: typeof peeled.default === "boolean" ? peeled.default : undefined,
        description: peeled.description,
      });
    }
    
    case "number": {
      const process = createV3ProcessFunction<number>(peeled.schema, "number");
      return new NumberEnvVarSchema({
        process,
        required: peeled.required,
        default: typeof peeled.default === "number" ? peeled.default : undefined,
        description: peeled.description,
      });
    }
    
    case "enum": {
      const values = extractV3EnumValues(def) || [];
      const process = createV3ProcessFunction<string>(peeled.schema, "enum");
      return new EnumEnvVarSchema({
        process,
        values,
        required: peeled.required,
        default: typeof peeled.default === "string" ? peeled.default : undefined,
        description: peeled.description,
      });
    }
    
    case "string":
    default: {
      const process = createV3ProcessFunction<string>(peeled.schema, "string");
      const defaultValue = 
        typeof peeled.default === "string" || peeled.default === null
          ? (peeled.default as string | null | undefined)
          : undefined;
          
      return new StringEnvVarSchema({
        process,
        required: peeled.required,
        default: defaultValue,
        description: peeled.description,
      });
    }
  }
}