import { z } from "zod";
import { askEnv } from "./src/index";

const schemas = {
  DATABASE_URL: z.string(),
  PORT: z.number().default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).optional(),
};

console.log("Testing EnumEnvPrompt with askEnv:");

askEnv(schemas, { envPath: ".env.test" }).catch(console.error);