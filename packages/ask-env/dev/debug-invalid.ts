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
 */
class InvalidEnvChannel implements EnvChannel {
  async get(): Promise<Record<string, string>> {
    console.log("🔍 InvalidEnvChannel.get() called, returning:", {
      DEBUG: "maybe"
    });
    return {
      DEBUG: "maybe",
    };
  }

  async set(values: Record<string, string>): Promise<void> {
    // No-op for testing
  }
}

// Test just the boolean field
const vars = {
  DEBUG: z.boolean().describe("Enable debug mode").default(false),
};

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

console.log("🚀 Starting session...");
await session.run();