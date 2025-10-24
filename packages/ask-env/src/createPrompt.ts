import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/typed/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/typed/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/typed/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/typed/EnvStringPrompt";
import type { EnvVarSchema, PreprocessorOptions } from "@envcredible/core";
import type { Theme } from "./visuals/Theme";
import type { AskEnvOptions } from "./AskEnvOptions";
import { parseBoolean } from "./utils/parseBoolean";

interface CreatePromptOptions {
  key: string;
  schema: EnvVarSchema;
  currentValue?: string;
  theme: Theme;
  truncate: number;
  shouldMask: boolean;
  hasPrevious: boolean;
  input?: Readable;
  output?: Writable;
  preprocessorOptions?: PreprocessorOptions;
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
    preprocessorOptions,
  } as const;

  switch (schema.type) {
    case "boolean":
      return new EnvBooleanPrompt(schema, {
        ...baseOptions,
        current:
          currentValue !== undefined ? parseBoolean(currentValue) : undefined,
      });
    case "number":
      return new EnvNumberPrompt(schema, {
        ...baseOptions,
        current:
          currentValue !== undefined ? parseFloat(currentValue) : undefined,
      });
    case "enum":
      return new EnvEnumPrompt(schema, {
        ...baseOptions,
        current: currentValue,
      });
    default:
      return new EnvStringPrompt(schema, {
        ...baseOptions,
        current: currentValue,
        secret: shouldMask,
      });
  }
}
