import { parse } from "../src";
import { define } from "@e-n-v/models";
import { z } from "zod";

const model = define({
  schemas: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DEBUG: z.boolean().default(false),
    PORT: z.coerce.number().min(1024).max(65535),
    API_BASE_URL: z.string().url(),
  },
  preprocess: true,
});

const env = parse(
  {
    NODE_ENV: "production",
    DEBUG: "true",
    PORT: "8080",
    API_BASE_URL: "https://api.example.com",
  },
  model,
);

void (env satisfies {
  NODE_ENV: "development" | "production" | "test";
  DEBUG: boolean;
  PORT: number;
  API_BASE_URL: string;
});

console.log("✅ Zod schemas inferred types:", {
  nodeEnv: env.NODE_ENV,
  debug: env.DEBUG,
  port: env.PORT,
  apiBaseUrl: env.API_BASE_URL,
});
