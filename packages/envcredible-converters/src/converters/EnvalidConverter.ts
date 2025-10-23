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
import type { SchemaConverter } from "../SchemaConverter";

/**
 * Envalid validator interface based on the library's structure
 */
interface EnvalidValidator<T = unknown> {
  _parse: (input: string) => T;
  choices?: readonly T[];
  default?: T;
  devDefault?: T;
  desc?: string;
  example?: string;
  docs?: string;
  requiredWhen?: (env: Record<string, unknown>) => boolean;
}

/**
 * Envalid schema converter implementation
 */
export class EnvalidConverter implements SchemaConverter<EnvalidValidator> {
  applies(schema: unknown): schema is EnvalidValidator {
    return isEnvalidValidator(schema);
  }

  convert(schema: EnvalidValidator): TypedEnvVarSchema {
    return convertFromEnvalidValidator(schema);
  }
}

/**
 * Default instance of the Envalid converter
 */
export const envalidConverter = new EnvalidConverter();

/**
 * Check if a schema is an Envalid validator
 */
export function isEnvalidValidator(schema: unknown): schema is EnvalidValidator {
  if (!schema || typeof schema !== "object") return false;
  
  // Envalid validators have a _parse function
  return typeof (schema as any)._parse === "function";
}

/**
 * Determine the environment variable type from an Envalid validator
 */
function resolveEnvalidType(validator: EnvalidValidator): EnvVarType {
  // Test the validator with sample values to determine type
  try {
    // Test boolean values first
    const booleanTestValues = ["true", "false", "1", "0", "yes", "no"];
    for (const testValue of booleanTestValues) {
      try {
        const result = validator._parse(testValue);
        if (typeof result === "boolean") {
          return "boolean";
        }
      } catch {
        // Continue testing
      }
    }

    // Test number values
    const numberTestValues = ["42", "3.14", "0"];
    for (const testValue of numberTestValues) {
      try {
        const result = validator._parse(testValue);
        if (typeof result === "number" && !isNaN(result)) {
          return "number";
        }
      } catch {
        // Continue testing
      }
    }

    // If choices are provided, it's likely an enum
    if (validator.choices && validator.choices.length > 0) {
      return "enum";
    }

    // Test with a simple string
    try {
      const result = validator._parse("test");
      if (typeof result === "string") {
        return "string";
      }
    } catch {
      // Continue
    }

    // Default to string if we can't determine
    return "string";
  } catch {
    return "string";
  }
}

/**
 * Extract choices from an Envalid validator
 */
function extractEnvalidChoices(validator: EnvalidValidator): string[] | undefined {
  if (validator.choices && Array.isArray(validator.choices)) {
    return validator.choices.map(choice => String(choice));
  }
  return undefined;
}

/**
 * Get default value, preferring devDefault in non-production environments
 */
function getDefaultValue(validator: EnvalidValidator): unknown {
  // In non-production environments, prefer devDefault if available
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction && validator.devDefault !== undefined) {
    return validator.devDefault;
  }
  
  return validator.default;
}

/**
 * Create a process function for Envalid validators
 */
function createEnvalidProcessFunction<T>(
  validator: EnvalidValidator,
  type: EnvVarType
): (value: string) => T | undefined {
  return (value: string): T | undefined => {
    try {
      const result = validator._parse(value);
      return result as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Envalid validation failed: ${message}`);
    }
  };
}

/**
 * Convert Envalid validator to TypedEnvVarSchema
 */
export function convertFromEnvalidValidator(validator: EnvalidValidator): TypedEnvVarSchema {
  const type = resolveEnvalidType(validator);
  const defaultValue = getDefaultValue(validator);
  const isRequired = defaultValue === undefined && !validator.devDefault;
  const description = validator.desc;

  switch (type) {
    case "boolean": {
      const process = createEnvalidProcessFunction<boolean>(validator, "boolean");
      return new BooleanEnvVarSchema({
        process,
        required: isRequired,
        default: typeof defaultValue === "boolean" ? defaultValue : undefined,
        description,
      });
    }
    
    case "number": {
      const process = createEnvalidProcessFunction<number>(validator, "number");
      return new NumberEnvVarSchema({
        process,
        required: isRequired,
        default: typeof defaultValue === "number" ? defaultValue : undefined,
        description,
      });
    }
    
    case "enum": {
      const choices = extractEnvalidChoices(validator) || [];
      const process = createEnvalidProcessFunction<string>(validator, "enum");
      return new EnumEnvVarSchema({
        process,
        values: choices,
        required: isRequired,
        default: typeof defaultValue === "string" ? defaultValue : undefined,
        description,
      });
    }
    
    case "string":
    default: {
      const process = createEnvalidProcessFunction<string>(validator, "string");
      const stringDefault = 
        typeof defaultValue === "string" || defaultValue === null
          ? (defaultValue as string | null | undefined)
          : undefined;
          
      return new StringEnvVarSchema({
        process,
        required: isRequired,
        default: stringDefault,
        description,
      });
    }
  }
}