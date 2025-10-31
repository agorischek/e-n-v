import type { EnvVarSchema, EnvVarType } from "@e-n-v/core";
import {
  BooleanEnvVarSchema,
  EnumEnvVarSchema,
  NumberEnvVarSchema,
  StringEnvVarSchema,
} from "@e-n-v/core";
import type { Struct } from "superstruct";
import type { SchemaConverter } from "../SchemaConverter";

type AnyStruct = Struct<any, any>;

type SuperstructLike = AnyStruct & {
  type?: unknown;
  validate?: unknown;
  create?: unknown;
};

/**
 * Superstruct schema converter implementation
 */
export class SuperstructConverter implements SchemaConverter<AnyStruct> {
  applies(schema: unknown): schema is AnyStruct {
    return isSuperstructSchema(schema);
  }

  convert(schema: AnyStruct): EnvVarSchema {
    return convertFromSuperstruct(schema);
  }
}

/**
 * Detect if a value looks like a Superstruct Struct instance
 */
export function isSuperstructSchema(value: unknown): value is AnyStruct {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as SuperstructLike;

  return (
    typeof candidate.type === "string" &&
    typeof candidate.validate === "function" &&
    typeof candidate.create === "function"
  );
}

/**
 * Convert a Superstruct schema to an EnvVarSchema
 */
export function convertFromSuperstruct(schema: AnyStruct): EnvVarSchema {
  const resolvedType = resolveSuperstructEnvVarType(schema);
  const required = isStructRequired(schema);
  const description = getStructDescription(schema);
  const defaultValue = getStructDefault(schema);

  if (resolvedType === "enum") {
    const values = extractEnumValues(schema);
    if (!values || values.length === 0) {
      return createStringEnvVarSchema(
        schema,
        required,
        defaultValue,
        description,
      );
    }

    const readonlyValues = values as readonly string[];
    const process = createSuperstructProcessFunction<string>(schema, "enum");

    return new EnumEnvVarSchema({
      process,
      values: readonlyValues,
      required,
      default: typeof defaultValue === "string" ? defaultValue : undefined,
      description,
    });
  }

  if (resolvedType === "boolean") {
    const process = createSuperstructProcessFunction<boolean>(
      schema,
      "boolean",
    );

    return new BooleanEnvVarSchema({
      process,
      required,
      default: typeof defaultValue === "boolean" ? defaultValue : undefined,
      description,
    });
  }

  if (resolvedType === "number") {
    const process = createSuperstructProcessFunction<number>(schema, "number");

    return new NumberEnvVarSchema({
      process,
      required,
      default: typeof defaultValue === "number" ? defaultValue : undefined,
      description,
    });
  }

  return createStringEnvVarSchema(schema, required, defaultValue, description);
}

function createStringEnvVarSchema(
  schema: AnyStruct,
  required: boolean,
  defaultValue: unknown,
  description?: string,
): StringEnvVarSchema {
  const process = createSuperstructProcessFunction<string>(schema, "string");

  return new StringEnvVarSchema({
    process,
    required,
    default: typeof defaultValue === "string" ? defaultValue : undefined,
    description,
  });
}

function resolveSuperstructEnvVarType(schema: AnyStruct): EnvVarType {
  const typeName = getStructType(schema);

  switch (typeName) {
    case "boolean":
      return "boolean";
    case "number":
    case "integer":
      return "number";
    case "enums":
      return "enum";
    case "literal": {
      const literalValue = (schema as any).schema;
      return typeof literalValue === "string" ? "enum" : "string";
    }
    default:
      return "string";
  }
}

function getStructType(schema: AnyStruct): string {
  const typeValue = (schema as any).type;
  return typeof typeValue === "string" ? typeValue : "unknown";
}

function extractEnumValues(schema: AnyStruct): string[] | undefined {
  const typeName = getStructType(schema);

  if (typeName === "enums") {
    const structSchema = (schema as any).schema;
    if (structSchema && typeof structSchema === "object") {
      const rawValues = Object.values(structSchema);
      if (rawValues.every((value) => typeof value === "string")) {
        return rawValues as string[];
      }
    }
  }

  if (typeName === "literal") {
    const value = (schema as any).schema;
    if (typeof value === "string") {
      return [value];
    }
  }

  return undefined;
}

function isStructRequired(schema: AnyStruct): boolean {
  try {
    const [error] = schema.validate(undefined);
    return !!error;
  } catch {
    return true;
  }
}

function getStructDefault(schema: AnyStruct): unknown {
  try {
    const [error, value] = schema.validate(undefined, { coerce: true });
    if (!error && value !== undefined) {
      return value;
    }
  } catch {
    // Ignore coercion errors when probing defaults
  }

  return undefined;
}

function getStructDescription(schema: AnyStruct): string | undefined {
  const structSchema = (schema as any).schema;
  if (
    structSchema &&
    typeof structSchema === "object" &&
    typeof (structSchema as any).description === "string"
  ) {
    return (structSchema as any).description;
  }

  if (typeof (schema as any).description === "string") {
    return (schema as any).description;
  }

  return undefined;
}

function createSuperstructProcessFunction<T>(
  schema: AnyStruct,
  type: EnvVarType,
): (value: unknown) => T | undefined {
  return (value: unknown): T | undefined => {
    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }

    let candidate: unknown = value;

    if (type === "number") {
      const trimmed = value.trim();
      if (trimmed === "") {
        candidate = undefined;
      } else {
        const parsed = Number(trimmed);
        if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
          throw new Error(`"${value}" is not a valid number`);
        }
        candidate = parsed;
      }
    } else if (type === "boolean") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "") {
        candidate = undefined;
      } else if (["true", "1", "yes", "on", "enabled"].includes(trimmed)) {
        candidate = true;
      } else if (["false", "0", "no", "off", "disabled"].includes(trimmed)) {
        candidate = false;
      } else {
        throw new Error(
          `"${value}" is not a valid boolean. Use: true/false, 1/0, yes/no, on/off, or enabled/disabled`,
        );
      }
    } else if (value === "") {
      candidate = undefined;
    }

    const [error, result] = schema.validate(candidate, { coerce: true });
    if (error) {
      throw new Error(error.message);
    }

    return result as T;
  };
}
