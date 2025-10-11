import type { CompatibleZodSchema } from "./zodCompat";
import {
  extractEnumValues,
  extractRangeConstraints,
  peelSchema,
  resolveEnvVarType,
} from "./zodCompat";
import { EnvVarSpec } from "./EnvVarSpec";
import type { EnvVarType } from "./EnvVarType";

export class ZodEnvVarSpec extends EnvVarSpec {
  constructor(schema: CompatibleZodSchema) {
    const {
      type,
      required,
      nullable,
      defaultValue,
      min,
      max,
      description,
      values,
    } = ZodEnvVarSpec.parseZodSchema(schema);

    super(type, required, nullable, defaultValue, min, max, description, values);
  }

  private static parseZodSchema(schema: CompatibleZodSchema) {
    const peeled = peelSchema(schema);
    const type = ZodEnvVarSpec.resolveType(peeled.schema);
    const { min, max } = extractRangeConstraints(peeled.schema);
    const values = extractEnumValues(peeled.schema);

    return {
      type,
      required: peeled.required,
      nullable: peeled.nullable,
      defaultValue: peeled.defaultValue,
      min,
      max,
      description: peeled.description,
      values,
    };
  }

  private static resolveType(schema: CompatibleZodSchema): EnvVarType {
    return resolveEnvVarType(schema);
  }
}