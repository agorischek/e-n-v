import type { ZodSchema } from "zod";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import type { EnvVarType } from "./specification/EnvVarType";
import { parseBoolean } from "./utils/parseBoolean";
import { validateFromSchema } from "./utils/validateFromSchema";
import type { Theme } from "./visuals/Theme";

interface CreatePromptOptions {
  type: EnvVarType;
  key: string;
  description?: string;
  defaultValue: unknown;
  required: boolean;
  schema: ZodSchema;
  values?: string[];
  currentValue?: string;
  theme: Theme;
  truncate: number;
  shouldMask: boolean;
  hasPrevious: boolean;
}

export function createPrompt({
  type,
  key,
  description,
  defaultValue,
  required,
  schema,
  values,
  currentValue,
  theme,
  truncate,
  shouldMask,
  hasPrevious,
}: CreatePromptOptions):
  | EnvBooleanPrompt
  | EnvNumberPrompt
  | EnvEnumPrompt
  | EnvStringPrompt {
  const baseOptions = {
    key,
    description,
    required,
    theme,
    maxDisplayLength: truncate,
    previousEnabled: hasPrevious,
  } as const;

  switch (type) {
    case "boolean":
      return new EnvBooleanPrompt({
        ...baseOptions,
        current:
          currentValue !== undefined ? parseBoolean(currentValue) : undefined,
        default: typeof defaultValue === "boolean" ? defaultValue : undefined,
        validate: validateFromSchema(schema),
      });
    case "number":
      return new EnvNumberPrompt({
        ...baseOptions,
        current:
          currentValue !== undefined ? parseFloat(currentValue) : undefined,
        default: typeof defaultValue === "number" ? defaultValue : undefined,
        validate: validateFromSchema(schema),
      });
    case "enum":
      return new EnvEnumPrompt({
        ...baseOptions,
        current: currentValue,
        default: typeof defaultValue === "string" ? defaultValue : undefined,
        options: values || [],
        validate: validateFromSchema(schema),
      });
    default:
      return new EnvStringPrompt({
        ...baseOptions,
        current: currentValue,
        default: typeof defaultValue === "string" ? defaultValue : undefined,
        secret: shouldMask,
        validate: validateFromSchema(schema),
      });
  }
}