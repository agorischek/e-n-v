import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import type { TypedEnvVarSchema, BooleanEnvVarSchema, NumberEnvVarSchema, EnumEnvVarSchema, StringEnvVarSchema, PreprocessorOptions } from "@envcredible/core";
import { applyPreprocessing } from "@envcredible/core";
import type { Theme } from "./visuals/Theme";
import type { AskEnvOptions } from "./AskEnvOptions";

interface CreatePromptOptions {
  key: string;
  schema: TypedEnvVarSchema;
  currentValue?: string;
  theme: Theme;
  truncate: number;
  shouldMask: boolean;
  hasPrevious: boolean;
  input?: Readable;
  output?: Writable;
  preprocessorOptions?: PreprocessorOptions;
}

/**
 * Apply custom preprocessing functions before schema processing
 */
export function applyCustomPreprocessing<T>(
  value: string,
  schema: TypedEnvVarSchema,
  preprocessorOptions?: PreprocessorOptions
): T | undefined {
  // Apply preprocessing
  const processedValue = applyPreprocessing(value, schema.type, preprocessorOptions);

  // If the preprocessing function returned the target type, use it directly
  if (schema.type === "boolean" && typeof processedValue === "boolean") {
    return processedValue as T;
  }
  if (schema.type === "number" && typeof processedValue === "number") {
    return processedValue as T;
  }

  // If it's still a string, pass it through the schema processor
  if (typeof processedValue === "string") {
    return (schema as any).process(processedValue) as T | undefined;
  }

  // Fallback to original schema processing
  return (schema as any).process(value) as T | undefined;
}

export function createPrompt({
  key,
  schema,
  currentValue,
  theme,
  truncate,
  shouldMask,
  hasPrevious,
  input,
  output,
  preprocessorOptions,
}: CreatePromptOptions):
  | EnvBooleanPrompt
  | EnvNumberPrompt
  | EnvEnumPrompt
  | EnvStringPrompt {
  const baseOptions = {
    key,
    theme,
    maxDisplayLength: truncate,
    previousEnabled: hasPrevious,
    input,
    output,
  } as const;

  switch (schema.type) {
    case "boolean":
      return new EnvBooleanPrompt(schema as BooleanEnvVarSchema, {
        ...baseOptions,
        current:
          currentValue !== undefined 
            ? applyCustomPreprocessing<boolean>(currentValue, schema, preprocessorOptions)
            : undefined,
      });
    case "number":
      return new EnvNumberPrompt(schema as NumberEnvVarSchema, {
        ...baseOptions,
        current:
          currentValue !== undefined 
            ? applyCustomPreprocessing<number>(currentValue, schema, preprocessorOptions)
            : undefined,
      });
    case "enum":
      return new EnvEnumPrompt(schema as EnumEnvVarSchema<any>, {
        ...baseOptions,
        current: currentValue !== undefined 
          ? applyCustomPreprocessing<string>(currentValue, schema, preprocessorOptions) as string
          : undefined,
      });
    default:
      return new EnvStringPrompt(schema as StringEnvVarSchema, {
        ...baseOptions,
        current: currentValue !== undefined 
          ? applyCustomPreprocessing<string>(currentValue, schema, preprocessorOptions) as string
          : undefined,
      });
  }
}
