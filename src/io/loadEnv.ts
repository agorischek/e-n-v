import { existsSync } from "fs";
import { config as dotenvConfig } from "dotenv";

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
  const result = dotenvConfig({ path: filePath, processEnv: {} });
  return result.parsed || {};
}