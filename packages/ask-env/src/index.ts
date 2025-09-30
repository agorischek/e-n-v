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

// Export environment file utilities (moved to envrw package)

// Export accessor types and implementations
export type { EnvChannel } from "./channels/EnvChannel";
export { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
export { DotEnvXChannel } from "./channels/dotenvx/DotEnvXChannel";

// Export channel types and utilities
export type { ChannelOptions } from "./channels/ChannelOptions";
export type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
export type { DefaultChannelConfig } from "./channels/default/DefaultChannelConfig";
export { resolveChannel } from "./channels/resolveChannel";

// Export pre-built schemas for common environment variables
export * from "./schemas";

// Export the askEnv function
export { askEnv } from "./askEnv";
