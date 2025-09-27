import {
  SchemaMap,
  intro,
  cancel,
  parseBoolean,
  validateWithSchema,
  outro,
} from ".";
import { EnvVarSpec } from "./schemas/EnvVarSpec";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { OverwritePrompt } from "./prompts/OverwritePrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import { SKIP_SYMBOL } from "./visuals/symbols";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { existsSync } from "fs";
import { isCancel } from "@clack/core";
import { loadEnvFromFile } from "./io/loadEnv";
import { writeEnvToFile } from "./io/writeEnv";

type AskEnvOptions = {
  envPath?: string;
  overwrite?: boolean;
}

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
    )} ${color.gray("(Skip with tab)")}\n${color.gray("│")}  `
  );

  // Check if .env file exists
  if (existsSync(envPath) && !overwrite) {
    const confirmPrompt = new OverwritePrompt({
      message: `${envPath} already exists. Do you want to overwrite it?`,
      theme: theme,
    } as any); // ThemedPromptOptions requires render function but OverwritePrompt provides its own

    const shouldOverwrite = await confirmPrompt.prompt();

    if (isCancel(shouldOverwrite) || !shouldOverwrite) {
      cancel("Setup cancelled.");
      return;
    }
  }

  const envValues: Record<string, string> = {};
  const schemaEntries = Object.entries(schemas);
  
  // Load current values from the .env file
  const currentEnvValues = loadEnvFromFile(envPath);

  for (const [key, schema] of schemaEntries) {
    // Add blank line before each prompt for better spacing (except first)
    if (Object.keys(envValues).length > 0) {
      console.log(color.gray("│"));
    }

    const { type, defaultValue, description, required, values } =
      EnvVarSpec.FromZodSchema(schema);

    // Get current value from the .env file if it exists and is not empty
    const current =
      currentEnvValues[key] && currentEnvValues[key].trim() !== ""
        ? currentEnvValues[key]
        : undefined;

    let value: unknown;

    switch (type) {
      case "boolean": {
        const prompt = new EnvBooleanPrompt({
          key,
          description,
          current: current !== undefined ? parseBoolean(current) : undefined,
          default: typeof defaultValue === "boolean" ? defaultValue : undefined,
          required,
          validate: (value) => validateWithSchema(value, schema),
          theme: theme,
        });

        value = await prompt.prompt();
        break;
      }

      case "number": {
        const prompt = new EnvNumberPrompt({
          key,
          description,
          current: current !== undefined ? parseFloat(current) : undefined,
          default: typeof defaultValue === "number" ? defaultValue : undefined,
          required,
          validate: (value) => validateWithSchema(value, schema),
          theme: theme,
        });

        value = await prompt.prompt();
        break;
      }

      case "enum": {
        const prompt = new EnvEnumPrompt({
          key,
          description,
          current,
          default: typeof defaultValue === "string" ? defaultValue : undefined,
          required,
          validate: (value) => validateWithSchema(value, schema),
          options: values || [],
          theme: theme,
        });

        value = await prompt.prompt();
        break;
      }

      default: {
        const prompt = new EnvStringPrompt({
          key,
          description,
          current,
          default: typeof defaultValue === "string" ? defaultValue : undefined,
          required,
          validate: (value) => validateWithSchema(value, schema),
          theme: theme,
        });

        value = await prompt.prompt();
        break;
      }
    }

    // Handle cancellation FIRST - check for clack cancel symbol
    if (
      isCancel(value) ||
      (typeof value === "symbol" &&
        (value as any).description === "clack:cancel")
    ) {
      cancel("Setup cancelled.");
      return;
    }

    // Handle skip symbol
    if (value === SKIP_SYMBOL) {
      continue; // Skip this environment variable
    }

    // Convert value to string for .env file
    envValues[key] = String(value);
  }

  // Generate .env content and write to file
  try {
    writeEnvToFile(envValues, envPath);
    outro(
      `Successfully wrote ${
        Object.keys(envValues).length
      } environment variables to ${envPath}`
    );
  } catch (error) {
    cancel(`❌ Failed to write to ${envPath}: ${error}`);
  }
}
