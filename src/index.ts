import { confirm, intro, outro, cancel, isCancel } from "@clack/prompts";
import { z } from "zod";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { StringEnvPrompt } from "./prompts/StringEnvPrompt";
import { NumberEnvPrompt } from "./prompts/NumberEnvPrompt";
import { BooleanEnvPrompt } from "./prompts/BooleanEnvPrompt";
import { EnumEnvPrompt } from "./prompts/EnumEnvPrompt";
import { SKIP_SYMBOL } from "./symbols";
import color from "picocolors";

export interface AskEnvOptions {
  envPath?: string;
  overwrite?: boolean;
}

export type SchemaMap = Record<string, z.ZodSchema>;

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas
 * @param options - Configuration options
 */
export async function askEnv(
  schemas: SchemaMap,
  options: AskEnvOptions = {}
): Promise<void> {
  const { envPath = ".env", overwrite = false } = options;

  intro("🔧 Environment Variable Setup");

  // Check if .env file exists
  if (existsSync(envPath) && !overwrite) {
    const shouldOverwrite = await confirm({
      message: `${envPath} already exists. Do you want to overwrite it?`,
    });

    if (isCancel(shouldOverwrite) || !shouldOverwrite) {
      cancel("Operation cancelled.");
      return;
    }
  }

  const defaultThemeColor = color.greenBright;

  const envValues: Record<string, string> = {};
  const schemaEntries = Object.entries(schemas);

  for (const [key, schema] of schemaEntries) {
    // Add blank line before each prompt for better spacing (except first)
    if (Object.keys(envValues).length > 0) {
      console.log(color.gray("│"));
    }

    // Get current value from process.env if it exists and is not empty
    const current =
      process.env[key] && process.env[key].trim() !== ""
        ? process.env[key]
        : undefined;

    // Get default value from schema if it exists
    const defaultValue = getDefaultValue(schema);

    // Get the base schema type (unwrapped from optional/default)
    const baseSchema = getBaseSchema(schema);

    let value: any;

    if (baseSchema instanceof z.ZodBoolean) {
      const prompt = new BooleanEnvPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current: current !== undefined ? parseBoolean(current) : undefined,
        default:
          defaultValue !== undefined ? parseBoolean(defaultValue) : undefined,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        themeColor: defaultThemeColor,
      });

      value = await prompt.prompt();
    } else if (baseSchema instanceof z.ZodNumber) {
      const prompt = new NumberEnvPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current: current !== undefined ? parseFloat(current) : undefined,
        default:
          defaultValue !== undefined ? parseFloat(defaultValue) : undefined,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        themeColor: defaultThemeColor,
      });

      value = await prompt.prompt();
    } else if (baseSchema instanceof z.ZodEnum) {
      // For enums, use EnumEnvPrompt with fixed options
      const prompt = new EnumEnvPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current,
        default: defaultValue,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        options: baseSchema._def.values,
        themeColor: defaultThemeColor,
      });

      value = await prompt.prompt();
    } else {
      // Default to string prompt for all other types
      const prompt = new StringEnvPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current,
        default: defaultValue,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        themeColor: defaultThemeColor,
      });

      value = await prompt.prompt();
    }

    // Handle cancellation FIRST - check for clack cancel symbol
    if (
      isCancel(value) ||
      (typeof value === "symbol" &&
        (value as any).description === "clack:cancel")
    ) {
      cancel("Operation cancelled.");
      return;
    }

    // Handle skip symbol
    if (value === SKIP_SYMBOL) {
      continue; // Skip this environment variable
    }

    // Convert value to string for .env file
    envValues[key] = String(value);
  }

  // Add final spacing
  console.log(color.gray("│"));

  // Generate .env content
  const envContent = Object.entries(envValues)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  try {
    writeFileSync(envPath, envContent + "\n");
    outro(
      `✅ Successfully wrote ${
        Object.keys(envValues).length
      } environment variables to ${envPath}`
    );
  } catch (error) {
    cancel(`❌ Failed to write to ${envPath}: ${error}`);
  }
}

/**
 * Get the base schema type (unwrapped from optional/default)
 */
function getBaseSchema(schema: z.ZodSchema): z.ZodSchema {
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
function isOptional(schema: z.ZodSchema): boolean {
  return schema instanceof z.ZodOptional;
}

/**
 * Get the default value from a schema if it exists
 */
function getDefaultValue(schema: z.ZodSchema): string | undefined {
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
function parseBoolean(value: string): boolean {
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
function getDescriptionForSchema(schema: z.ZodSchema): string | undefined {
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
function validateWithSchema(
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

export default askEnv;
