import { z } from "zod";
import { prompt } from "../src";
import { defaults } from "../src";

await prompt({
  vars: {
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
  secrets: [...defaults.SECRET_PATTERNS, /CUSTOM_SENSITIVE/i],
});
