import { text, confirm, intro, outro, cancel, isCancel } from '@clack/prompts';
import { z } from 'zod';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

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
  const { envPath = '.env', overwrite = false } = options;
  
  intro('🔧 Environment Variable Setup');

  // Check if .env file exists
  if (existsSync(envPath) && !overwrite) {
    const shouldOverwrite = await confirm({
      message: `${envPath} already exists. Do you want to overwrite it?`,
    });

    if (isCancel(shouldOverwrite) || !shouldOverwrite) {
      cancel('Operation cancelled.');
      return;
    }
  }

  const envValues: Record<string, string> = {};
  const schemaEntries = Object.entries(schemas);

  for (const [key, schema] of schemaEntries) {
    let isValid = false;
    let value: string = '';

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
              return error.errors.map(e => e.message).join(', ');
            }
            return 'Invalid value';
          }
        },
      });

      if (isCancel(input)) {
        cancel('Operation cancelled.');
        return;
      }

      value = input as string;
      isValid = true;
    }

    envValues[key] = value;
  }

  // Generate .env content
  const envContent = Object.entries(envValues)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    writeFileSync(envPath, envContent + '\n');
    outro(`✅ Successfully wrote ${Object.keys(envValues).length} environment variables to ${envPath}`);
  } catch (error) {
    cancel(`❌ Failed to write to ${envPath}: ${error}`);
  }
}

/**
 * Generate a helpful placeholder text based on the Zod schema type
 */
function getPlaceholderForSchema(schema: z.ZodSchema): string {
  if (schema instanceof z.ZodString) {
    return 'Enter a string value';
  }
  if (schema instanceof z.ZodNumber) {
    return 'Enter a number';
  }
  if (schema instanceof z.ZodBoolean) {
    return 'true or false';
  }
  if (schema instanceof z.ZodEnum) {
    const options = schema._def.values;
    return `One of: ${options.join(', ')}`;
  }
  if (schema instanceof z.ZodOptional) {
    return `${getPlaceholderForSchema(schema._def.innerType)} (optional)`;
  }
  if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue();
    return `Default: ${defaultValue}`;
  }
  return 'Enter a value';
}

export default askEnv;