import type { CompatibleZodSchema } from "./zodCompat";
import {
  extractEnumValues,
  extractRangeConstraints,
  peelSchema,
  resolveEnvVarType,
} from "./zodCompat";
import type {
  BooleanEnvVarSchema,
  EnvVarSchema,
  EnvVarSchemaDetails,
  NumberEnvVarSchema,
  StringEnvVarSchema,
  EnumEnvVarSchema,
} from "./EnvVarSchema";
import { validateFromSchema } from "../utils/validateFromSchema";

function createBaseDetails<TValue>(
  schema: CompatibleZodSchema,
  details: EnvVarSchemaDetails<TValue>
): EnvVarSchemaDetails<TValue> {
  const validate = validateFromSchema(schema);
  return {
    ...details,
    validate: (value) => validate(value),
  };
}

export function fromZodSchema(schema: CompatibleZodSchema): EnvVarSchema {
  const peeled = peelSchema(schema);
  const type = resolveEnvVarType(peeled.schema);
  const { min, max } = extractRangeConstraints(peeled.schema);
  const values = extractEnumValues(peeled.schema);

  switch (type) {
    case "boolean": {
      const base = createBaseDetails<boolean>(schema, {
        type,
        required: peeled.required,
        nullable: peeled.nullable,
        defaultValue:
          typeof peeled.defaultValue === "boolean"
            ? peeled.defaultValue
            : undefined,
        description: peeled.description,
      });

      const result: BooleanEnvVarSchema = {
        ...base,
        type,
      };

      return result;
    }
    case "number": {
      const base = createBaseDetails<number>(schema, {
        type,
        required: peeled.required,
        nullable: peeled.nullable,
        defaultValue:
          typeof peeled.defaultValue === "number"
            ? peeled.defaultValue
            : undefined,
        description: peeled.description,
      });

      const result: NumberEnvVarSchema = {
        ...base,
        type,
        min,
        max,
      };

      return result;
    }
    case "enum": {
      const defaultValue =
        typeof peeled.defaultValue === "string"
          ? peeled.defaultValue
          : undefined;

      const base = createBaseDetails<string>(schema, {
        type,
        required: peeled.required,
        nullable: peeled.nullable,
        defaultValue,
        description: peeled.description,
      });

      const result: EnumEnvVarSchema = {
        ...base,
        type,
        values: values ?? [],
      };

      return result;
    }
    case "string":
    default: {
      const defaultValue =
        typeof peeled.defaultValue === "string" || peeled.defaultValue === null
          ? (peeled.defaultValue as string | null | undefined)
          : undefined;

      const base = createBaseDetails<string>(schema, {
        type: "string",
        required: peeled.required,
        nullable: peeled.nullable,
        defaultValue,
        description: peeled.description,
      });

      const result: StringEnvVarSchema = {
        ...base,
        type: "string",
        min,
        max,
      };

      return result;
    }
  }
}
