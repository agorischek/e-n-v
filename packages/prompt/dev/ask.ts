import { z } from "zod";
import { prompt } from "../src";
import { define } from "@e-n-v/models";

import { DATABASE_PASSWORD } from "@e-n-v/schemas";

const schemas = {
  DATABASE_PASSWORD,
  // RABBITMQ_URL,
  // DATABASE_URL: z.string().describe("Database connection URL").default("hey"),
  // UNSET_STRING: z.string().optional(),
  // PORT: z.number().min(1024).max(65535).default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("test"),
  MAX_CONNECTIONS: z.number().optional(),
};

// Test overload 1: Using model and interactive options
const envModel = define({ schemas });
await prompt(envModel, { path: ".env", root: import.meta.url });

// Test overload 2: Using combined options
// await prompt({ schemas, path: ".env", root: import.meta.url });
