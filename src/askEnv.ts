import {
  SchemaMap,
  intro,
  cancel,
  parseBoolean,
  validateFromSchema,
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
import { EnvPrompt } from "./prompts/EnvPrompt";
import { EnvChannel } from "./channels/EnvChannel";
import { DefaultEnvChannel } from "./channels/DefaultEnvChannel";
import type { ChannelOptions } from "./channels/types";
import { resolveChannel } from "./channels/resolveChannel";

type AskEnvOptions = {
  envPath?: string;
  overwrite?: boolean;
  channel?: ChannelOptions;
};

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas
 * @param options - Configuration options
 */
export async function askEnv(
  schemas: SchemaMap,
  options: AskEnvOptions = {}
): Promise<void> {
  const { envPath = ".env", overwrite = false, channel } = options;

  // Create channel using the resolver
  const envChannel = resolveChannel(channel, envPath);

  // Create theme object using magenta as the primary color
  const theme = new Theme(color.magenta);

  intro(
    `${theme.bgPrimary(
      color.black(" Environment Variable Setup ")
    )} ${color.gray("(Skip with tab)")}\n${color.gray("│")}  `
  );

  // Check if .env file exists (for DefaultEnvChannel only)
  if (envChannel instanceof DefaultEnvChannel && existsSync(envPath) && !overwrite) {
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

  const schemaEntries = Object.entries(schemas);
  let savedCount = 0;

  for (const [key, schema] of schemaEntries) {
    // Add blank line before each prompt for better spacing (except first)
    if (savedCount > 0) {
      console.log(color.gray("│"));
    }

    const { type, defaultValue, description, required, values } =
      EnvVarSpec.FromZodSchema(schema);

    // Get current value from the channel for this specific key
    const currentValue = envChannel.get(key);
    const current = currentValue && currentValue.trim() !== "" ? currentValue : undefined;

    let prompt: EnvPrompt<unknown>;

    switch (type) {
      case "boolean": {
        prompt = new EnvBooleanPrompt({
          key,
          description,
          current: current !== undefined ? parseBoolean(current) : undefined,
          default: typeof defaultValue === "boolean" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          theme: theme,
        });
        break;
      }

      case "number": {
        prompt = new EnvNumberPrompt({
          key,
          description,
          current: current !== undefined ? parseFloat(current) : undefined,
          default: typeof defaultValue === "number" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          theme: theme,
        });
        break;
      }

      case "enum": {
        prompt = new EnvEnumPrompt({
          key,
          description,
          current,
          default: typeof defaultValue === "string" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          options: values || [],
          theme: theme,
        });
        break;
      }

      default: {
        prompt = new EnvStringPrompt({
          key,
          description,
          current,
          default: typeof defaultValue === "string" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          theme: theme,
        });
        break;
      }
    }
    const value = await prompt.prompt();

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
    const stringValue = String(value);

    // Save the environment variable immediately
    try {
      await envChannel.set(key, stringValue);
      savedCount++;
    } catch (error) {
      cancel(`❌ Failed to save ${key}: ${error}`);
      return;
    }
  }

  // Final success message
  try {
    outro(
      `Successfully saved ${savedCount} environment variable${savedCount !== 1 ? 's' : ''}${envChannel instanceof DefaultEnvChannel ? ` to ${envPath}` : ""}`
    );
  } catch (error) {
    cancel(`❌ Error displaying final message: ${error}`);
  }
}
