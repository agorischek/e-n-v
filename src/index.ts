import {
  text,
  confirm,
  intro,
  outro,
  cancel,
  isCancel,
  select,
} from "./prompts";
import { z } from "zod";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

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

  const envValues: Record<string, string> = {};
  const schemaEntries = Object.entries(schemas);

  for (const [key, schema] of schemaEntries) {
    let value: string = "";

    // Check if we should use select for this schema type
    if (shouldUseSelect(schema)) {
      const options = getSelectOptions(schema);
      const defaultValue = getDefaultValue(schema);
      const input = await select({
        message: `Select value for ${key}:`,
        options,
        initialValue: defaultValue,
      });

      if (isCancel(input)) {
        cancel("Operation cancelled.");
        return;
      }

      value = input as string;
    } else {
      let isValid = false;

      while (!isValid) {
        const input = await text({
          message: `Enter value for ${key}:`,
          placeholder: getPlaceholderForSchema(schema),
          validate: (value) => {
            try {
              schema.parse(value);
              return undefined; // Valid
            } catch (error) {
              if (error instanceof z.ZodError) {
                return error.errors.map((e) => e.message).join(", ");
              }
              return "Invalid value";
            }
          },
        });

        if (isCancel(input)) {
          cancel("Operation cancelled.");
          return;
        }

        value = input as string;
        isValid = true;
      }
    }

    envValues[key] = value;
  }

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
 * Determine if a schema should use select instead of text input
 */
function shouldUseSelect(schema: z.ZodSchema): boolean {
  // Check for wrapped schemas (optional, default)
  let unwrappedSchema = schema;
  if (schema instanceof z.ZodOptional) {
    unwrappedSchema = schema._def.innerType;
  }
  if (unwrappedSchema instanceof z.ZodDefault) {
    unwrappedSchema = unwrappedSchema._def.innerType;
  }

  return (
    unwrappedSchema instanceof z.ZodEnum ||
    unwrappedSchema instanceof z.ZodBoolean
  );
}

/**
 * Get the default value from a schema if it exists
 */
function getDefaultValue(schema: z.ZodSchema): string | undefined {
  if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue();
    return String(defaultValue);
  }
  return undefined;
}

/**
 * Get select options for enum and boolean schemas
 */
function getSelectOptions(
  schema: z.ZodSchema
): Array<{ value: string; label: string }> {
  // Check for wrapped schemas (optional, default)
  let unwrappedSchema = schema;
  if (schema instanceof z.ZodOptional) {
    unwrappedSchema = schema._def.innerType;
  }
  if (unwrappedSchema instanceof z.ZodDefault) {
    unwrappedSchema = unwrappedSchema._def.innerType;
  }

  const defaultValue = getDefaultValue(schema);

  if (unwrappedSchema instanceof z.ZodEnum) {
    const options = unwrappedSchema._def.values;
    return options.map((value: string) => ({
      value,
      label: value === defaultValue ? `${value} (default)` : value,
    }));
  }

  if (unwrappedSchema instanceof z.ZodBoolean) {
    return [
      {
        value: "true",
        label: "true" === defaultValue ? "true (default)" : "true",
      },
      {
        value: "false",
        label: "false" === defaultValue ? "false (default)" : "false",
      },
    ];
  }

  return [];
}

/**
 * Generate a helpful placeholder text based on the Zod schema type
 * Note: Enum and Boolean types now use select instead of text input
 */
function getPlaceholderForSchema(schema: z.ZodSchema): string {
  if (schema instanceof z.ZodString) {
    return "Enter a string value";
  }
  if (schema instanceof z.ZodNumber) {
    return "Enter a number";
  }
  if (schema instanceof z.ZodOptional) {
    return `${getPlaceholderForSchema(schema._def.innerType)} (optional)`;
  }
  if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue();
    return `Default: ${defaultValue}`;
  }
  return "Enter a value";
}

export default askEnv;
