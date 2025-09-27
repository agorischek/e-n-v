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
  public readonly type: EnvVarType;
  public readonly required: boolean = true;
  public readonly nullable: boolean = false;
  public readonly defaultValue?: unknown;
  public readonly min?: number;
  public readonly max?: number;
  public readonly description?: string;
  public readonly enumOptions?: string[];

  constructor(schema: ZodTypeAny) {
    let current: ZodTypeAny = schema;

    while (true) {
      if (!this.description) {
        if (
          "description" in current &&
          typeof current.description === "string"
        ) {
          this.description = current.description;
        } else if (
          "description" in current._def &&
          typeof current._def.description === "string"
        ) {
          this.description = current._def.description;
        }
      }

      if (current instanceof ZodOptional) {
        this.required = false;
        current = current._def.innerType;
      } else if (current instanceof ZodNullable) {
        this.nullable = true;
        current = current._def.innerType;
      } else if (current instanceof ZodDefault) {
        this.defaultValue = current._def.defaultValue();
        current = current._def.innerType;
      } else if (current instanceof ZodEffects) {
        current = current._def.schema;
      } else {
        break;
      }
    }

    const unwrapped = current;

    this.type = this.resolveType(unwrapped);

    // Extract constraints for string and number types
    if (unwrapped instanceof ZodString || unwrapped instanceof ZodNumber) {
      for (const check of unwrapped._def.checks ?? []) {
        if (check.kind === "min") this.min = check.value;
        if (check.kind === "max") this.max = check.value;
      }
    }

    // Extract enum options
    if (unwrapped instanceof ZodEnum) {
      this.enumOptions = unwrapped._def.values;
    }
  }

  private resolveType(schema: ZodTypeAny): EnvVarType {
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
