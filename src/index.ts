import { z } from "zod";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { Writable } from "node:stream";
import { StringEnvPrompt } from "./prompts/StringEnvPrompt";
import { NumberEnvPrompt } from "./prompts/NumberEnvPrompt";
import { BooleanEnvPrompt } from "./prompts/BooleanEnvPrompt";
import { EnumEnvPrompt } from "./prompts/EnumEnvPrompt";
import { SKIP_SYMBOL, S_BAR, S_BAR_END, S_BAR_START } from "./visuals/symbols";
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

// Simple check for cancellation - checks for common cancel symbols
export const isCancel = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "symbol") {
    const description = (value as any).description;
    return description === "clack:cancel" || description === "ask-env:skip";
  }
  return false;
};

export interface AskEnvOptions {
  envPath?: string;
  overwrite?: boolean;
}

export type SchemaMap = Record<string, z.ZodSchema>;

/**
 * Get the base schema type (unwrapped from optional/default)
 */
export function getBaseSchema(schema: z.ZodSchema): z.ZodSchema {
  let unwrapped = schema;
  if (schema instanceof z.ZodOptional) {
    unwrapped = schema._def.innerType;
  }
  if (unwrapped instanceof z.ZodDefault) {
    unwrapped = unwrapped._def.innerType;
  }
  return unwrapped;
}

/**
 * Check if a schema is optional
 */
export function isOptional(schema: z.ZodSchema): boolean {
  return schema instanceof z.ZodOptional;
}

/**
 * Get the default value from a schema if it exists
 */
export function getDefaultValue(schema: z.ZodSchema): string | undefined {
  if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue();
    return String(defaultValue);
  }
  // Check nested optional/default combinations
  if (
    schema instanceof z.ZodOptional &&
    schema._def.innerType instanceof z.ZodDefault
  ) {
    const defaultValue = schema._def.innerType._def.defaultValue();
    return String(defaultValue);
  }
  return undefined;
}

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
 * Generate description for schema
 */
export function getDescriptionForSchema(
  schema: z.ZodSchema
): string | undefined {
  // First check if the schema has a description
  if ((schema as any)._def?.description) {
    return (schema as any)._def.description;
  }

  // Check nested schemas (optional/default wrappers)
  if (
    schema instanceof z.ZodOptional &&
    (schema._def.innerType as any)._def?.description
  ) {
    return (schema._def.innerType as any)._def.description;
  }

  if (
    schema instanceof z.ZodDefault &&
    (schema._def.innerType as any)._def?.description
  ) {
    return (schema._def.innerType as any)._def.description;
  }

  // If no description is found, return undefined (no generic descriptions)
  return undefined;
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
