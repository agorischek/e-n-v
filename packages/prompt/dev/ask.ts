import { z } from "zod";
import { prompt } from "../src";

import { DATABASE_PASSWORD } from "@e-n-v/schemas";

const vars = {
  DATABASE_PASSWORD,
  // RABBITMQ_URL,
  // DATABASE_URL: z.string().describe("Database connection URL").default("hey"),
  // UNSET_STRING: z.string().optional(),
  // PORT: z.number().min(1024).max(65535).default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("test"),
  MAX_CONNECTIONS: z.number().optional(),
};

await prompt({ schemas, path: ".env", root: import.meta.url });
