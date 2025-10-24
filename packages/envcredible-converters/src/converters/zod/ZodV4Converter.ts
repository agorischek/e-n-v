import type { $ZodType } from "zod/v4/core";
import * as z4core from "zod/v4/core";
import { z } from "zod";
import type { EnvVarSchema, EnvVarType } from "@envcredible/core";
import {
  BooleanEnvVarSchema,
  NumberEnvVarSchema,
  StringEnvVarSchema,
  EnumEnvVarSchema,
} from "@envcredible/core";
import type { SchemaConverter } from "../SchemaConverter";

/**
 * Zod v4 schema converter implementation
 */
export class ZodV4Converter implements SchemaConverter<$ZodType> {
  applies(schema: unknown): schema is $ZodType {
    return isZodV4Schema(schema);
  }

  convert(schema: $ZodType): EnvVarSchema {
    return convertFromZodV4Schema(schema);
  }
}

/**
 * Zod v4 schema definition
 */
interface ZodV4Def {
  type?: string;
  innerType?: $ZodType;
  schema?: $ZodType;
  in?: $ZodType;
  out?: $ZodType;
  inner?: $ZodType;
  defaultValue?: (() => unknown) | unknown;
  prefaultValue?: (() => unknown) | unknown;
  description?: string;
  values?: unknown[];
  entries?: Record<string, unknown>;
}

/**
 * Check if a schema is a Zod v4 schema
 */
export function isZodV4Schema(schema: unknown): schema is $ZodType {
  if (!schema || typeof schema !== "object") return false;

  // Check for Zod v4 specific _zod property
  return "_zod" in (schema as any);
}

/**
 * Extract definition from Zod v4 schema
 */
function getV4Def(schema: $ZodType): ZodV4Def {
  const container = schema as any;
  if (container._zod && container._zod.def) {
    return container._zod.def;
  }
  return {};
}

/**
 * Get the type name from a Zod v4 definition
 */
function getV4TypeName(def: ZodV4Def): string {
  return def.type || "unknown";
}

/**
 * Check if a type is a wrapper type that should be unwrapped
 */
function isV4WrapperType(typeName: string): boolean {
  return [
    "optional",
    "default",
    "catch",
    "readonly",
    "brand",
    "prefault",
    "nullable",
    "nullish",
  ].includes(typeName);
}

/**
 * Get inner schema from wrapper
 */
function getV4InnerSchema(def: ZodV4Def): $ZodType | undefined {
  return def.innerType || def.schema || def.in || def.inner;
}

/**
 * Get default value from definition
 */
function getV4DefaultValue(def: ZodV4Def): unknown {
  if (def.defaultValue !== undefined) {
    return typeof def.defaultValue === "function"
      ? def.defaultValue()
      : def.defaultValue;
  }
  if (def.prefaultValue !== undefined) {
    return typeof def.prefaultValue === "function"
      ? def.prefaultValue()
      : def.prefaultValue;
  }
  return undefined;
}

/**
 * Extract enum values from schema
 */
function extractV4EnumValues(def: ZodV4Def): string[] | undefined {
  if (Array.isArray(def.values)) {
    return def.values.map((v) => String(v));
  }

  if (def.entries && typeof def.entries === "object") {
    return Object.values(def.entries).map((v) => String(v));
  }

  return undefined;
}

/**
 * Get description from schema
 */
function getV4Description(schema: $ZodType, def: ZodV4Def): string | undefined {
  const directDesc = (schema as any).description;
  if (typeof directDesc === "string" && directDesc.length > 0) {
    return directDesc;
  }

  if (typeof def.description === "string" && def.description.length > 0) {
    return def.description;
  }

  // Check meta function
  const metaFn = (schema as any).meta;
  if (typeof metaFn === "function") {
    const meta = metaFn.call(schema);
    if (meta?.description && typeof meta.description === "string") {
      return meta.description.trim();
    }
  }

  return undefined;
}

/**
 * Resolve environment variable type from schema
 */
function resolveV4EnvVarType(schema: $ZodType): EnvVarType {
  const def = getV4Def(schema);
  const typeName = getV4TypeName(def);

  switch (typeName) {
    case "string":
      return "string";
    case "number":
    case "int":
      return "number";
    case "boolean":
    case "stringbool":
      return "boolean";
    case "pipe": {
      // Handle stringbool pipes
      if (def.in && def.out) {
        const inType = resolveV4EnvVarType(def.in);
        const outType = resolveV4EnvVarType(def.out);
        if (inType === "string" && outType === "boolean") {
          return "boolean";
        }
      }
      return "string";
    }
    case "enum":
      return "enum";
    default:
      if (def.values || def.entries) return "enum";
      return "string";
  }
}

/**
 * Peel wrapper types from schema
 */
interface V4PeeledResult {
  schema: $ZodType;
  required: boolean;
  default: unknown;
  description?: string;
}

function peelV4Schema(schema: $ZodType): V4PeeledResult {
  let current = schema;
  let required = true;
  let defaultValue: unknown = undefined;
  let description: string | undefined = undefined;

  // Unwrap wrapper types (max 20 iterations to prevent infinite loops)
  for (let i = 0; i < 20; i++) {
    const def = getV4Def(current);
    const typeName = getV4TypeName(def);

    if (!description) {
      description = getV4Description(current, def);
    }

    if (!isV4WrapperType(typeName)) {
      // Special case: don't unwrap stringbool pipes
      if (typeName === "pipe" && def.in && def.out) {
        const inType = resolveV4EnvVarType(def.in);
        const outType = resolveV4EnvVarType(def.out);
        if (inType === "string" && outType === "boolean") {
          break; // Keep the pipe for stringbool
        }
      } else {
        break;
      }
    }

    if (typeName === "optional" || typeName === "nullish") {
      required = false;
    }

    if (
      (typeName === "default" || typeName === "prefault") &&
      defaultValue === undefined
    ) {
      defaultValue = getV4DefaultValue(def);
    }

    const inner = getV4InnerSchema(def);
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
 * Create a process function for Zod v4 schemas
 */
function createV4ProcessFunction<T>(
  schema: $ZodType,
  type: EnvVarType,
  originalSchema: $ZodType,
): (value: string) => T | undefined {
  return (value: string): T | undefined => {
    try {
      let processSchema = schema;

      // For stringbool pipes, use the original schema
      const def = getV4Def(schema);
      const typeName = getV4TypeName(def);

      if (
        typeName === "stringbool" ||
        (typeName === "pipe" &&
          def.in &&
          def.out &&
          resolveV4EnvVarType(def.in) === "string" &&
          resolveV4EnvVarType(def.out) === "boolean")
      ) {
        processSchema = originalSchema;
      } else if (type === "number") {
        // Use regular Zod coerce.number() which creates v4 schemas
        processSchema = z.coerce.number() as any;
      } else if (type === "boolean") {
        // Use stringbool for v4 boolean conversion
        processSchema = z.stringbool() as any;
      }

      const result = z4core.safeParse(processSchema, value);
      if (result.success) {
        return result.data as T;
      }

      throw new Error(
        `Failed to parse value "${value}": ${result.error.issues
          .map((issue) => issue.message)
          .join("; ")}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message);
    }
  };
}

/**
 * Convert Zod v4 schema to EnvVarSchema
 */
export function convertFromZodV4Schema(schema: $ZodType): EnvVarSchema {
  const peeled = peelV4Schema(schema);
  const type = resolveV4EnvVarType(peeled.schema);
  const def = getV4Def(peeled.schema);

  switch (type) {
    case "boolean": {
      const process = createV4ProcessFunction<boolean>(
        peeled.schema,
        "boolean",
        schema,
      );
      return new BooleanEnvVarSchema({
        process,
        required: peeled.required,
        default:
          typeof peeled.default === "boolean" ? peeled.default : undefined,
        description: peeled.description,
      });
    }

    case "number": {
      const process = createV4ProcessFunction<number>(
        peeled.schema,
        "number",
        schema,
      );
      return new NumberEnvVarSchema({
        process,
        required: peeled.required,
        default:
          typeof peeled.default === "number" ? peeled.default : undefined,
        description: peeled.description,
      });
    }

    case "enum": {
      const values = extractV4EnumValues(def) || [];
      const process = createV4ProcessFunction<string>(
        peeled.schema,
        "enum",
        schema,
      );
      return new EnumEnvVarSchema({
        process,
        values,
        required: peeled.required,
        default:
          typeof peeled.default === "string" ? peeled.default : undefined,
        description: peeled.description,
      });
    }

    case "string":
    default: {
      const process = createV4ProcessFunction<string>(
        peeled.schema,
        "string",
        schema,
      );
      const defaultValue =
        typeof peeled.default === "string" ? (peeled.default as string) : undefined;

      return new StringEnvVarSchema({
        process,
        required: peeled.required,
        default: defaultValue,
        description: peeled.description,
      });
    }
  }
}
