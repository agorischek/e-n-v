import { z } from "zod";
import { askEnv } from "../src/askEnv";
import dotenvx from "@dotenvx/dotenvx";

const schemas = {
  DATABASE_URL: z
    .string()
    .describe("Database connection URL")
    .default("my-connection"),
};

// Test the askEnv function
await askEnv(schemas, {
  path: ".env.x",
  channel: dotenvx,
});

