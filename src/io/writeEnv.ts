import { writeFileSync } from "fs";

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