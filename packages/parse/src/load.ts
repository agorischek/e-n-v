import type { EnvVarSchema, Preprocessors } from "@e-n-v/core";
import { resolvePreprocessor } from "@e-n-v/core";
import { EnvModel } from "@e-n-v/models";
import type { InferEnvType, SupportedSchema } from "@e-n-v/models";
import { resolveSchemas } from "@e-n-v/converters";
import type { ParseEnvOptions } from "../ParseEnvOptions";
import { MissingEnvVarError } from "./errors/MissingEnvVarError";
import { ValidationError } from "./errors/ValidationError";
import { EnvValidationAggregateError } from "./errors/EnvValidationAggregateError";

/**
 * Parse and validate environment variables from a source object
 * Does NOT mutate process.env
 *
 * @param source - Source object containing raw environment variable values
 * @param model - Environment variable model (EnvModel instance)
 * @returns Strongly typed validated environment variables
 * @throws EnvValidationAggregateError if any validation errors occur
 */
export function parse<T extends Record<string, SupportedSchema>>(
  source: Record<string, string> | NodeJS.ProcessEnv,
  model: EnvModel<T>,
): InferEnvType<T>;

/**
 * Parse and validate environment variables from a source object
 * Does NOT mutate process.env
 *
 * @param source - Source object containing raw environment variable values
 * @param options - Parse options containing schemas and preprocessing config
 * @returns Strongly typed validated environment variables
 * @throws EnvValidationAggregateError if any validation errors occur
 */
export function parse<T extends Record<string, SupportedSchema>>(
  source: Record<string, string> | NodeJS.ProcessEnv,
  options: ParseEnvOptions<T>,
): InferEnvType<T>;

/**
 * Parse and validate environment variables from a source object
 * Does NOT mutate process.env
 */
export function parse<T extends Record<string, SupportedSchema>>(
  source: Record<string, string> | NodeJS.ProcessEnv,
  modelOrOptions: EnvModel<T> | ParseEnvOptions<T>,
): InferEnvType<T> {
  let resolvedSchemas: Record<string, EnvVarSchema>;
  let preprocessConfig: Preprocessors;

  // Determine which overload is being used
  if (modelOrOptions instanceof EnvModel) {
    // First overload: (source, model)
    const model = modelOrOptions;
    resolvedSchemas = model.schemas;
    preprocessConfig = model.preprocess;
  } else {
    // Second overload: (source, options)
    const options = modelOrOptions;
    resolvedSchemas = resolveSchemas(options.schemas);
    
    // Resolve preprocessor configuration (same logic as EnvModel)
    const config = options.preprocess;
    if (config === false) {
      preprocessConfig = {
        string: null,
        number: null,
        bool: null,
        enum: null,
      };
    } else if (config === true || config === undefined) {
      preprocessConfig = {};
    } else {
      preprocessConfig = { ...config };
    }
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
        errors.push(new MissingEnvVarError(key));
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
        } else if (schema.required) {
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
      errors.push(new ValidationError(key, rawValue, message));
      result[key] = undefined;
    }
  }

  // Throw aggregate error if there were any errors
  if (errors.length > 0) {
    throw new EnvValidationAggregateError(errors);
  }

  return result as InferEnvType<T>;
}
