import z from "zod";
import {
  SchemaMap,
  AskEnvOptions,
  intro,
  isCancel,
  cancel,
  getDefaultValue,
  getBaseSchema,
  getDescriptionForSchema,
  parseBoolean,
  isOptional,
  validateWithSchema,
  outro,
} from ".";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { OverwritePrompt } from "./prompts/OverwritePrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import { SKIP_SYMBOL } from "./visuals/symbols";
import { Theme } from "./Theme";
import * as color from "picocolors";
import { writeFileSync, existsSync } from "fs";

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
  
    // Create theme object using magenta as the primary color
  const theme = new Theme(color.magenta);

  intro(
    `${theme.bgPrimary(
      color.black(" Environment Variable Setup ")
    )}\n${color.gray("│")}  `
  );

  // Check if .env file exists
  if (existsSync(envPath) && !overwrite) {
    const confirmPrompt = new OverwritePrompt({
      message: `${envPath} already exists. Do you want to overwrite it?`,
      themeColor: theme.primary,
    });

    const shouldOverwrite = await confirmPrompt.prompt();

    if (isCancel(shouldOverwrite) || !shouldOverwrite) {
      cancel("Operation cancelled.");
      return;
    }
  }

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
      const prompt = new EnvBooleanPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current: current !== undefined ? parseBoolean(current) : undefined,
        default:
          defaultValue !== undefined ? parseBoolean(defaultValue) : undefined,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        theme: theme,
      });

      value = await prompt.prompt();
    } else if (baseSchema instanceof z.ZodNumber) {
      const prompt = new EnvNumberPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current: current !== undefined ? parseFloat(current) : undefined,
        default:
          defaultValue !== undefined ? parseFloat(defaultValue) : undefined,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        theme: theme,
      });

      value = await prompt.prompt();
    } else if (baseSchema instanceof z.ZodEnum) {
      // For enums, use EnumEnvPrompt with fixed options
      const prompt = new EnvEnumPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current,
        default: defaultValue,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        options: baseSchema._def.values,
        theme: theme,
      });

      value = await prompt.prompt();
    } else {
      // Default to string prompt for all other types
      const prompt = new EnvStringPrompt({
        key,
        description: getDescriptionForSchema(schema),
        current,
        default: defaultValue,
        required: !isOptional(schema),
        validate: (value) => validateWithSchema(value, schema),
        theme: theme,
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
