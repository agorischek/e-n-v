import { z } from "zod";
import { Session } from "../src/session/Session";
import { Theme } from "../src/visuals/Theme";
import { resolveSchemas } from "@envcredible/converters";
import { stdin, stdout } from "node:process";
import * as color from "picocolors";
import * as defaults from "../src/defaults";
import type { EnvChannel } from "@envcredible/core";

/**
 * Custom EnvChannel that returns invalid number
 */
class InvalidNumberChannel implements EnvChannel {
  async get(): Promise<Record<string, string>> {
    return {
      PORT: "not-a-number",
    };
  }

  async set(values: Record<string, string>): Promise<void> {
    // No-op for testing
  }
}

// Test just the number field
const vars = {
  PORT: z.number().min(1024).max(65535).describe("Server port number").default(3000),
};

const schemas = resolveSchemas(vars);
const channel = new InvalidNumberChannel();
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

console.log("🚀 Starting session with invalid number...");
await session.run();