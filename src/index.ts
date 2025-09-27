import { z } from "zod";
import type { Writable } from "node:stream";

import { S_BAR, S_BAR_END, S_BAR_START } from "./visuals/symbols";
import color from "picocolors";

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
  return trimmed === "true";
}

/**
 * Higher-order function that returns a validator function for a given schema
 */
export function validateFromSchema(schema: z.ZodSchema) {
  return (value: unknown): string | undefined => {
    const result = schema.safeParse(value);
    if (result.success) {
      return undefined; // Valid
    }
    return result.error.errors.map((e) => e.message).join(", ");
  };
}

// Export environment file utilities
export { loadEnvFromFile } from "./channels/DefaultEnvChannel";
export { writeEnvToFile } from "./channels/DefaultEnvChannel";
export { updateEnvValue, updateEnvContentValue, updateEnvValues } from "./channels/DefaultEnvChannel";

// Export accessor types and implementations
export type { EnvChannel as EnvAccessor } from "./channels/EnvChannel";
export { DefaultEnvChannel as DefaultEnvAccessor } from "./channels/DefaultEnvChannel";
export { DotEnvXChannel as DotEnvXAccessor } from "./channels/DotEnvXChannel";
export type { DotEnvXChannelOptions as DotEnvXAccessorOptions } from "./channels/DotEnvXChannel";
