import { z } from "zod";
import { askEnv } from "../src/askEnv";
import { DEFAULT_SECRET_PATTERNS } from "../src/utils/secrets";

await askEnv(
  {
    API_TOKEN: z.string().min(8, "API token must be at least 8 characters"),
    DATABASE_URL: z
      .string()
      .url("Must be a valid connection string")
      .describe("Database connection string"),
    PUBLIC_ENDPOINT: z
      .string()
      .url("Must be a valid URL")
      .default("https://example.com"),
    CUSTOM_SENSITIVE_VALUE: z
      .string()
      .describe("Custom secret value that relies on the extended pattern list"),
  },
  {
    secretPatterns: [...DEFAULT_SECRET_PATTERNS, /CUSTOM_SENSITIVE/i],
  }
);
