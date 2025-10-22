import type { CompatibleZodSchema } from "./zodCompat";
import { extractEnumValues, peelSchema, resolveEnvVarType } from "./zodCompat";
import type {
  EnvVarSchemaUnion,
} from "@envcredible/types";
import {
  BooleanEnvVarSchema as BooleanEnvVarSchemaClass,
  NumberEnvVarSchema as NumberEnvVarSchemaClass,
  StringEnvVarSchema as StringEnvVarSchemaClass,
  EnumEnvVarSchema as EnumEnvVarSchemaClass,
} from "@envcredible/types";
import { processFromSchema } from "./processFromSchema";

export function fromZodSchema(schema: CompatibleZodSchema): EnvVarSchemaUnion {
  const peeled = peelSchema(schema);
  const type = resolveEnvVarType(peeled.schema);
  const values = extractEnumValues(peeled.schema);

  switch (type) {
    case "boolean": {
      const process = processFromSchema<boolean>(schema, "boolean");
      
      return new BooleanEnvVarSchemaClass({
        process,
        required: peeled.required,
        default: typeof peeled.default === "boolean" ? peeled.default : undefined,
        description: peeled.description,
      });
    }
    case "number": {
      const process = processFromSchema<number>(schema, "number");
      
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