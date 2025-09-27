import { z } from "zod";
import type { Writable } from "node:stream";

import { SKIP_SYMBOL, S_BAR, S_BAR_END, S_BAR_START } from "./visuals/symbols";
import color from "picocolors";

// Re-export core classes and types
export { EnvVarSpec } from "./schemas/EnvVarSpec";
export { EnvVarType } from "./schemas/EnvVarType";
export { AskEnvOptions } from "./AskEnvOption";
export { askEnv } from "./askEnv";

interface CommonOptions {
  output?: Writable;
}

export const cancel = (message = "", opts?: CommonOptions) => {
  const output: Writable = opts?.output ?? process.stdout;
  output.write(`${color.gray(S_BAR_END)}  ${color.red(message)}\n\n`);
};

export const intro = (title = "", opts?: CommonOptions) => {
  const output: Writable = opts?.output ?? process.stdout;
  output.write(`${color.gray(S_BAR_START)}  ${title}\n`);
};

export const outro = (message = "", opts?: CommonOptions) => {
  const output: Writable = opts?.output ?? process.stdout;
  output.write(
    `${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  ${message}\n\n`
  );
};

export type SchemaMap = Record<string, z.ZodSchema>;

/**
 * Parse boolean from string value
 */
export function parseBoolean(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed === "true" ||
    trimmed === "1" ||
    trimmed === "yes" ||
    trimmed === "y"
  );
}

/**
 * Validate value with Zod schema
 */
export function validateWithSchema(
  value: any,
  schema: z.ZodSchema
): string | undefined {
  try {
    schema.parse(value);
    return undefined; // Valid
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map((e) => e.message).join(", ");
    }
    return "Invalid value";
  }
}
