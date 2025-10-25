// Example: Using AggregateEnvChannel

import define from "e-n-v/define";
import { z } from "zod";

// Example 1: Simple array syntax (overwrite=true by default)
// Later channels override earlier ones
export const env1 = define({
  path: ".env.local",
  vars: {
    PORT: z.number(),
    API_URL: z.string().url(),
  },
  channel: [
    { name: "default" },  // Reads from .env.local first
    { name: "process" },  // Then process.env (overwrites .env.local values)
  ],
});

// Example 2: Explicit config with overwrite option
// Earlier channels take precedence (overwrite=false)
export const env2 = define({
  path: ".env",
  vars: {
    DATABASE_URL: z.string().url(),
    PORT: z.number(),
  },
  channel: {
    aggregate: [
      { name: "process" },     // Check process.env first
      { name: "default" },     // Fall back to .env file
    ],
    overwrite: false,  // process.env values take precedence
  },
});

// Example 3: Combining multiple .env files
// Use case: Load from .env, then .env.local, then .env.production
export const env3 = define({
  path: ".env",  // Default for first channel
  vars: {
    PORT: z.number(),
    DATABASE_URL: z.string().url(),
    API_KEY: z.string(),
  },
  channel: {
    aggregate: [
      "default",              // .env (base config)
      // Could add more file-based channels here if needed
    ],
    overwrite: true,  // Later files override earlier ones
  },
});

// Example 4: Process.env as fallback
// Perfect for containerized environments where some vars come from the container
export const env4 = define({
  path: ".env.defaults",
  vars: {
    PORT: z.number().default(3000),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
  },
  channel: [
    { name: "default" },  // Load defaults from file
    { name: "process" },  // Override with process.env if set
  ],
});
