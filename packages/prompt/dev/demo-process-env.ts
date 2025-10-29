import { z } from "zod";

// Inline ProcessEnvChannel for demonstration
class ProcessEnvChannel {
  async get(): Promise<Record<string, string>> {
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
    return env;
  }

  async set(values: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      process.env[key] = value;
    }
  }
}

const vars = {
  PORT: z
    .number()
    .int()
    .min(1024)
    .max(65535)
    .describe("Server port (1024-65535)"),
  ENABLE_CACHE: z.boolean().describe("Enable cache flag (true or false)"),
  API_BASE_URL: z.url().describe("Base URL of the API service"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .describe("Node environment"),
};

console.log("Testing ProcessEnvChannel with process.env values...\n");

// Set some invalid values in process.env to demonstrate validation
process.env.PORT = "invalid_port";
process.env.ENABLE_CACHE = "maybe";
process.env.API_BASE_URL = "not_a_url";
process.env.NODE_ENV = "staging"; // Invalid enum value

const channel = new ProcessEnvChannel();

// Get current values from process.env
const currentEnv = await channel.get();
console.log("Current process.env values:");
console.log("PORT:", currentEnv.PORT);
console.log("ENABLE_CACHE:", currentEnv.ENABLE_CACHE);
console.log("API_BASE_URL:", currentEnv.API_BASE_URL);
console.log("NODE_ENV:", currentEnv.NODE_ENV);
console.log();

// Test validation
console.log("Validating current values:");
for (const [key, schema] of Object.entries(vars)) {
  const value = currentEnv[key];
  try {
    const parsed = schema.parse(value);
    console.log(`✅ ${key}: ${parsed} (valid)`);
  } catch (error: any) {
    console.log(`❌ ${key}: "${value}" (invalid - ${error.message})`);
  }
}

console.log("\n🎯 ProcessEnvChannel successfully reads from process.env!");
console.log("The channel can be used with the prompt function using:");
console.log('  channel: "processenv" or channel: { process: true }');
