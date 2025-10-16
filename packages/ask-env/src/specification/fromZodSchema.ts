import type { CompatibleZodSchema } from "./zodCompat";
import { extractEnumValues, peelSchema, resolveEnvVarType } from "./zodCompat";
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
  details: EnvVarSchemaDetails<TValue>,
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
        default:
          typeof peeled.default === "boolean" ? peeled.default : undefined,
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
        default:
          typeof peeled.default === "number" ? peeled.default : undefined,
        description: peeled.description,
      });

      const result: NumberEnvVarSchema = {
        ...base,
        type,
      };

      return result;
    }
    case "enum": {
      const defaultValue =
        typeof peeled.default === "string" ? peeled.default : undefined;

      const base = createBaseDetails<string>(schema, {
        type,
        required: peeled.required,
        default: defaultValue,
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
        typeof peeled.default === "string" || peeled.default === null
          ? (peeled.default as string | null | undefined)
          : undefined;

      const base = createBaseDetails<string>(schema, {
        type: "string",
        required: peeled.required,
        default: defaultValue,
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
