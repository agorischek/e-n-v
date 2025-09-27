import { EnvChannel } from "../EnvChannel";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { config as dotenvConfig } from "dotenv";

/**
 * Default implementation of EnvAccessor that works with .env files
 */
export class DefaultEnvChannel implements EnvChannel {
  private filePath: string;
  private cachedValues?: Record<string, string>;

  /**
   * Create a new DefaultEnvAccessor
   * @param filePath - Path to the .env file to manage
   */
  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Get the value of an environment variable
   * @param key - The environment variable key
   * @returns The value of the environment variable, or undefined if not found
   */
  get(key: string): string | undefined {
    this.ensureLoaded();
    return this.cachedValues?.[key];
  }

  /**
   * Set the value of an environment variable
   * @param key - The environment variable key
   * @param value - The value to set
   * @returns Promise that resolves when the value has been set
   */
  async set(key: string, value: string): Promise<void> {
    this.ensureFileExists();
    updateEnvValue(this.filePath, key, value);
    // Update cache
    this.ensureLoaded();
    if (this.cachedValues) {
      this.cachedValues[key] = value;
    }
  }

  /**
   * Clear the cache to force reload on next access
   */
  clearCache(): void {
    this.cachedValues = undefined;
  }

  /**
   * Ensure the cached values are loaded from file
   */
  private ensureLoaded(): void {
    if (this.cachedValues === undefined) {
      this.cachedValues = loadEnvFromFile(this.filePath);
    }
  }

  /**
   * Ensure the .env file exists, create empty one if it doesn't
   */
  private ensureFileExists(): void {
    if (!existsSync(this.filePath)) {
      writeEnvToFile({}, this.filePath);
    }
  }
}

/**
 * Load environment variables from a file without modifying process.env
 * @param filePath - Path to the .env file to load
 * @returns Object containing the parsed environment variables
 */
export function loadEnvFromFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  // Parse the .env file without modifying process.env
  const result = dotenvConfig({ path: filePath, processEnv: {}, quiet: true });
  return result.parsed || {};
}

/**
 * Write environment variables to a .env file
 * @param envValues - Object containing key-value pairs to write
 * @param filePath - Path to the .env file to write to
 * @throws Error if writing to file fails
 */
export function writeEnvToFile(
  envValues: Record<string, string>,
  filePath: string
): void {
  // Generate .env content
  const envContent = Object.entries(envValues)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  writeFileSync(filePath, envContent + "\n");
}

/**
 * Update a specific environment variable value in a .env file while preserving
 * comments, formatting, and the order of variables
 * @param filePath - Path to the .env file
 * @param key - Environment variable key to update
 * @param value - New value for the environment variable
 * @throws Error if the file doesn't exist or cannot be read/written
 */
export function updateEnvValue(
  filePath: string,
  key: string,
  value: string
): void {
  const content = readFileSync(filePath, "utf8");
  const updatedContent = updateEnvContentValue(content, key, value);
  writeFileSync(filePath, updatedContent);
}

/**
 * Update a specific environment variable value in .env file content while preserving
 * comments, formatting, and the order of variables
 * @param content - The content of the .env file
 * @param key - Environment variable key to update
 * @param value - New value for the environment variable
 * @returns Updated .env file content
 */
export function updateEnvContentValue(
  content: string,
  key: string,
  value: string
): string {
  const lines = content.split("\n");
  let keyFound = false;
  
  // Escape special regex characters in the key
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  // Create regex to match the key with optional whitespace and quotes
  const keyRegex = new RegExp(`^\\s*${escapedKey}\\s*=.*$`);
  
  const updatedLines = lines.map((line) => {
    if (keyRegex.test(line)) {
      keyFound = true;
      // Preserve the original indentation
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : "";
      
      // Extract trailing comment if it exists
      // Look for # that is not escaped and not inside quotes
      let trailingComment = "";
      const valueAndCommentMatch = line.match(/^[^=]*=([^#]*)(#.*)?$/);
      if (valueAndCommentMatch && valueAndCommentMatch[2]) {
        // Check if the # is not inside quotes
        const valuePartBeforeComment = valueAndCommentMatch[1];
        if (valuePartBeforeComment) {
          const openQuotes = (valuePartBeforeComment.match(/"/g) || []).length;
          // If even number of quotes, the # is outside quotes (it's a comment)
          if (openQuotes % 2 === 0) {
            trailingComment = ` ${valueAndCommentMatch[2]}`;
          }
        } else {
          // No value part before comment, so it's definitely a comment
          trailingComment = ` ${valueAndCommentMatch[2]}`;
        }
      }
      
      // Format the value (add quotes if it contains spaces, special chars, or is empty)
      const formattedValue = formatEnvValue(value);
      
      return `${indent}${key}=${formattedValue}${trailingComment}`;
    }
    return line;
  });
  
  // If key wasn't found, append it at the end
  if (!keyFound) {
    // Add a newline if the file doesn't end with one
    if (updatedLines[updatedLines.length - 1] !== "") {
      updatedLines.push("");
    }
    updatedLines.push(`${key}=${formatEnvValue(value)}`);
  }
  
  return updatedLines.join("\n");
}

/**
 * Format an environment variable value for .env file
 * Adds quotes if the value contains spaces, special characters, or is empty
 * @param value - The value to format
 * @returns Formatted value
 */
function formatEnvValue(value: string): string {
  // If value is empty, return empty string without quotes
  if (value === "") {
    return "";
  }
  
  // Check if value needs quotes (contains spaces, quotes, or special chars)
  const needsQuotes = /[\s"'#$`\\]/.test(value);
  
  if (needsQuotes) {
    // Escape existing double quotes and backslashes
    const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escapedValue}"`;
  }
  
  return value;
}

/**
 * Update multiple environment variable values in a .env file while preserving
 * comments, formatting, and the order of variables
 * @param filePath - Path to the .env file
 * @param updates - Object containing key-value pairs to update
 * @throws Error if the file doesn't exist or cannot be read/written
 */
export function updateEnvValues(
  filePath: string,
  updates: Record<string, string>
): void {
  let content = readFileSync(filePath, "utf8");
  
  for (const [key, value] of Object.entries(updates)) {
    content = updateEnvContentValue(content, key, value);
  }
  
  writeFileSync(filePath, content);
}