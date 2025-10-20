import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import type { EnvVarSchema } from "./specification/EnvVarSchema";
import { parseBoolean } from "./utils/parseBoolean";
import type { Theme } from "./visuals/Theme";

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
