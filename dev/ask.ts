import { z } from "zod";
import { askEnv } from "../src/askEnv";
import { DATABASE_PASSWORD, PORT, RABBITMQ_URL } from "../src/schemas";

const envMap = {
  DATABASE_PASSWORD,
  // DATABASE_URL: z.string().describe("Database connection URL").default("hey"),
  // UNSET_STRING: z.string().optional(),
  // PORT: z.number().min(1024).max(65535).default(3000),
  // DEBUG: z.boolean().default(false),
  // NODE_ENV: z.enum(["development", "production", "test"]).default("test"),
  // MAX_CONNECTIONS: z.number().optional(),
};

await askEnv(envMap);