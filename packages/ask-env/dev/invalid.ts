import { z } from "zod";
import { Session } from "../src/session/Session";
import { Theme } from "../src/visuals/Theme";
import { resolveSchemas } from "@envcredible/converters";
import { stdin, stdout } from "node:process";
import * as color from "picocolors";
import * as defaults from "../src/defaults";
import type { EnvChannel } from "@envcredible/core";

/**
 * Custom EnvChannel implementation that always returns invalid values
 * to test invalid value display behavior in all prompt types
 */
class InvalidEnvChannel implements EnvChannel {
  async get(): Promise<Record<string, string>> {
    // Return all invalid values, ignoring any key filter
    return {
      // String type - invalid because it doesn't match email format
      EMAIL: "not-a-valid-email",
      
      // Number type - invalid because it's not a number
      PORT: "not-a-number",
      
      // Boolean type - invalid because it's not true/false
      DEBUG: "maybe",
      
      // Enum type - invalid because it's not one of the allowed values
      NODE_ENV: "invalid-env",
      
      // Additional test cases
      PASSWORD: "short", // Invalid if there's a min length requirement
      MAX_CONNECTIONS: "-5", // Invalid negative number
      API_KEY: "", // Invalid empty string
      TIMEOUT: "99999999999999999999", // Invalid number (too large)
    };
  }

  async set(values: Record<string, string>): Promise<void> {
    // No-op for testing
  }
}

// Define schemas that will validate against the invalid values
const vars = {
  EMAIL: z.string().email().describe("User email address"),
  PORT: z.number().min(1024).max(65535).describe("Server port number").default(3000),
  DEBUG: z.boolean().describe("Enable debug mode").default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).describe("Node environment").default("development"),
  PASSWORD: z.string().min(8).describe("Database password"),
  MAX_CONNECTIONS: z.number().min(1).max(1000).describe("Maximum database connections").default(100),
  API_KEY: z.string().min(1).describe("API key for external service"),
  TIMEOUT: z.number().min(1000).max(30000).describe("Request timeout in milliseconds").default(5000),
};

// Use the Session directly with our custom channel
const schemas = resolveSchemas(vars);
const channel = new InvalidEnvChannel();
const theme = new Theme(color.magenta);

const session = new Session({
  schemas,
  channel,
  secrets: defaults.SECRET_PATTERNS,
  truncate: defaults.TRUNCATE_LENGTH,
  theme,
  input: stdin,
  output: stdout,
  path: ".env",
});

await session.run();