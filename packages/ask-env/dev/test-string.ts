import { z } from "zod";
import { Session } from "../src/session/Session";
import { Theme } from "../src/visuals/Theme";
import { resolveSchemas } from "@envcredible/converters";
import { stdin, stdout } from "node:process";
import * as color from "picocolors";
import * as defaults from "../src/defaults";
import type { EnvChannel } from "@envcredible/core";

/**
 * Custom EnvChannel that returns invalid email
 */
class InvalidEmailChannel implements EnvChannel {
  async get(): Promise<Record<string, string>> {
    return {
      EMAIL: "not-a-valid-email",
    };
  }

  async set(values: Record<string, string>): Promise<void> {
    // No-op for testing
  }
}

// Test just the email field (string with validation)
const vars = {
  EMAIL: z.string().email().describe("User email address"),
};

const schemas = resolveSchemas(vars);
const channel = new InvalidEmailChannel();
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

console.log("🚀 Starting session with invalid email...");
await session.run();