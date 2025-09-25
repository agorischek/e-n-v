import { z } from "zod";
import { askEnv } from "../src/index";
import pc from "picocolors"


const schemas = {
  DATABASE_URL: z.string().describe("Database connection URL"),
  PORT: z.number().min(1024).max(65535).default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MAX_CONNECTIONS: z.number().optional(),
};

// Test the askEnv function
askEnv(schemas, { envPath: ".env.test" }).catch(console.error);