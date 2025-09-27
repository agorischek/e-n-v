import {
  ZodTypeAny,
  ZodEffects,
  ZodDefault,
  ZodNullable,
  ZodOptional,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodEnum,
} from "zod";
import { EnvVarType } from "./EnvVarType";

export class EnvVarSpec {
  private constructor(
    public readonly type: EnvVarType,
    public readonly required: boolean = true,
    public readonly nullable: boolean = false,
    public readonly defaultValue?: unknown,
    public readonly min?: number,
    public readonly max?: number,
    public readonly description?: string,
    public readonly values?: string[]
  ) {}

  public static FromZodSchema(schema: ZodTypeAny): EnvVarSpec {
    let current: ZodTypeAny = schema;
    let required = true;
    let nullable = false;
    let defaultValue: unknown = undefined;
    let description: string | undefined = undefined;
    let min: number | undefined = undefined;
    let max: number | undefined = undefined;
    let values: string[] | undefined = undefined;

    while (true) {
      if (!description) {
        if (
          "description" in current &&
          typeof current.description === "string"
        ) {
          description = current.description;
        } else if (
          "description" in current._def &&
          typeof current._def.description === "string"
        ) {
          description = current._def.description;
        }
      }

      if (current instanceof ZodOptional) {
        required = false;
        current = current._def.innerType;
      } else if (current instanceof ZodNullable) {
        nullable = true;
        current = current._def.innerType;
      } else if (current instanceof ZodDefault) {
        defaultValue = current._def.defaultValue();
        current = current._def.innerType;
      } else if (current instanceof ZodEffects) {
        current = current._def.schema;
      } else {
        break;
      }
    }

    const unwrapped = current;

    const type = EnvVarSpec.resolveType(unwrapped);

    // Extract constraints for string and number types
    if (unwrapped instanceof ZodString || unwrapped instanceof ZodNumber) {
      for (const check of unwrapped._def.checks ?? []) {
        if (check.kind === "min") min = check.value;
        if (check.kind === "max") max = check.value;
      }
    }

    // Extract enum options
    if (unwrapped instanceof ZodEnum) {
      values = unwrapped._def.values;
    }

    return new EnvVarSpec(type, required, nullable, defaultValue, min, max, description, values);
  }

  private static resolveType(schema: ZodTypeAny): EnvVarType {
    if (schema instanceof ZodString) {
      return "string";
    } else if (schema instanceof ZodNumber) {
      return "number";
    } else if (schema instanceof ZodBoolean) {
      return "boolean";
    } else if (schema instanceof ZodEnum) {
      return "enum";
    } else {
      // For any other types, default to string
      return "string";
    }
  }
}
