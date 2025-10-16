import type { CompatibleZodSchema } from "./zodCompat";
import {
  extractEnumValues,
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
  const values = extractEnumValues(peeled.schema);

  switch (type) {
    case "boolean": {
      const base = createBaseDetails<boolean>(schema, {
        type,
        required: peeled.required,
        preset:
          typeof peeled.preset === "boolean"
            ? peeled.preset
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
        preset:
          typeof peeled.preset === "number"
            ? peeled.preset
            : undefined,
        description: peeled.description,
      });

      const result: NumberEnvVarSchema = {
        ...base,
        type,
      };

      return result;
    }
    case "enum": {
      const preset =
        typeof peeled.preset === "string"
          ? peeled.preset
          : undefined;

      const base = createBaseDetails<string>(schema, {
        type,
        required: peeled.required,
        preset,
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
      const preset =
        typeof peeled.preset === "string" || peeled.preset === null
          ? (peeled.preset as string | null | undefined)
          : undefined;

      const base = createBaseDetails<string>(schema, {
        type: "string",
        required: peeled.required,
        preset,
        description: peeled.description,
      });

      const result: StringEnvVarSchema = {
        ...base,
        type: "string",
      };

      return result;
    }
  }
}
