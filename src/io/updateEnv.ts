import { readFileSync, writeFileSync } from "fs";

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
      const match = line.match(/^(\s*)/);
      const indent = match ? match[1] : "";
      
      // Format the value (add quotes if it contains spaces, special chars, or is empty)
      const formattedValue = formatEnvValue(value);
      
      return `${indent}${key}=${formattedValue}`;
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