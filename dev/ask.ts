import { z } from "zod";
import { askEnv } from "../src/askEnv";

const schemas = {
  DATABASE_URL: z.string().describe("Database connection URL").default("hey"),
  UNSET_STRING: z.string().optional(),
  PORT: z.number().min(1024).max(65535).default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("test"),
  MAX_CONNECTIONS: z.number().optional(),
};

// Test the askEnv function
await askEnv(schemas).catch(console.error);