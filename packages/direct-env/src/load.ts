import type { EnvMeta } from "@envcredible/meta";
import type { EnvMetaOptions } from "@envcredible/meta";
import { EnvMeta as EnvMetaClass } from "@envcredible/meta";
import type { EnvVarSchema } from "@envcredible/core";
import { resolvePreprocessor } from "@envcredible/core";
import type { DirectEnvOptions } from "./options/DirectEnvOptions";
import { MissingEnvVarError } from "./errors/MissingEnvVarError";
import { ValidationError } from "./errors/ValidationError";
import { EnvValidationAggregateError } from "./errors/EnvValidationAggregateError";

/**
 * Load and validate environment variables from a channel
 * Does NOT mutate process.env
 * 
 * @param meta - EnvMeta instance or EnvMetaOptions
 * @param options - Loading options
 * @returns Promise resolving to validated environment variables
 * @throws EnvValidationAggregateError if any validation errors occur in strict mode
 */
export async function load<T extends Record<string, any> = Record<string, any>>(
  meta: EnvMeta | EnvMetaOptions,
  options: DirectEnvOptions = {}
): Promise<T> {
  // Normalize to EnvMeta instance
  const envMeta = meta instanceof EnvMetaClass ? meta : new EnvMetaClass(meta);

  // Extract options
  const { preprocess, strict = true } = options;

  // Read all values from the channel
  const rawValues = await envMeta.channel.get();

  // Result object and error collection
  const result: Record<string, any> = {};
  const errors: Array<MissingEnvVarError | ValidationError> = [];

  // Process each schema
  for (const [key, schema] of Object.entries(envMeta.schemas)) {
    const rawValue = rawValues[key];

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
    const preprocessor = resolvePreprocessor(schema.type, preprocess ?? envMeta.preprocess);
    const preprocessedValue = preprocessor ? preprocessor(rawValue) : rawValue;

    // Convert to string if preprocessor returned native type
    const stringValue = typeof preprocessedValue === "string" 
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
