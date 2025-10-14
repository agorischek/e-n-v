import { z } from "zod";
import { askEnv } from "../src/askEnv";

import { join } from "desm";
import { blue } from "picocolors";
import type { SchemaMap } from "../src/types";
import { DATABASE_PASSWORD, RABBITMQ_URL } from "../../zod-env-var-schemas/src";

const envMap: SchemaMap = {
  DATABASE_PASSWORD,
  RABBITMQ_URL,
  DATABASE_URL: z.string().describe("Database connection URL").default("hey"),
  UNSET_STRING: z.string().optional(),
  PORT: z.number().min(1024).max(65535).default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("test"),
  MAX_CONNECTIONS: z.number().optional(),
};

const path = join(import.meta.url, ".env");

await askEnv(envMap, { path, theme: blue });
