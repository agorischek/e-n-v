import type { EnvVarSchema, Preprocessors } from "@e-n-v/core";
import { resolvePreprocessor } from "@e-n-v/core";
import { resolveSchemas } from "@e-n-v/converters";
import type { DirectEnvOptions } from "./options/DirectEnvOptions";
import { MissingEnvVarError } from "./errors/MissingEnvVarError";
import { ValidationError } from "./errors/ValidationError";
import { EnvValidationAggregateError } from "./errors/EnvValidationAggregateError";

/**
 * Load and validate environment variables from a source object
 * Does NOT mutate process.env
 *
 * @param options - Loading options including source and vars/spec
 * @returns Validated environment variables
 * @throws EnvValidationAggregateError if any validation errors occur in strict mode
 */
export function parse<T extends Record<string, any> = Record<string, any>>(
  options: DirectEnvOptions,
): T {
  // Extract options
  const { source, strict = true } = options;

  // Support both legacy vars and new spec
  let resolvedSchemas: Record<string, EnvVarSchema>;
  let preprocessConfig: Preprocessors | undefined;

  if (options.spec) {
    resolvedSchemas = options.spec.schemas;
    preprocessConfig = options.preprocess ?? options.spec.preprocess;
  } else if (options.vars) {
    resolvedSchemas = resolveSchemas(options.vars);
    preprocessConfig = options.preprocess;
  } else {
    throw new Error("Either 'vars' or 'spec' must be provided");
  }

  // Result object and error collection
  const result: Record<string, any> = {};
  const errors: Array<MissingEnvVarError | ValidationError> = [];

  // Process each schema
  for (const [key, schema] of Object.entries(resolvedSchemas)) {
    const rawValue = source[key];

    // Handle missing values
    if (rawValue === undefined || rawValue.trim() === "") {
      if (schema.default !== undefined) {
        result[key] = schema.default;
        continue;
      }

      if (schema.required) {
        if (strict) {
          errors.push(new MissingEnvVarError(key));
        }
        result[key] = undefined;
        continue;
      }

      result[key] = undefined;
      continue;
    }

    // Preprocess the value
    const preprocessor = resolvePreprocessor(schema.type, preprocessConfig);
    const preprocessedValue = preprocessor ? preprocessor(rawValue) : rawValue;

    // Convert to string if preprocessor returned native type
    const stringValue =
      typeof preprocessedValue === "string"
        ? preprocessedValue
        : String(preprocessedValue);

    // Process through schema
    try {
      const processedValue = schema.process(stringValue);

      // Handle undefined result from processor
      if (processedValue === undefined) {
        if (schema.default !== undefined) {
          result[key] = schema.default;
        } else if (schema.required && strict) {
          errors.push(new MissingEnvVarError(key));
          result[key] = undefined;
        } else {
          result[key] = undefined;
        }
      } else {
        result[key] = processedValue;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (strict) {
        errors.push(new ValidationError(key, rawValue, message));
      }
      result[key] = undefined;
    }
  }

  // Throw aggregate error if there were any errors in strict mode
  if (strict && errors.length > 0) {
    throw new EnvValidationAggregateError(errors);
  }

  return result as T;
}
