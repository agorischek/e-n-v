import { z } from "zod";
import { askEnv } from "../src/askEnv";
import dotenvx from "@dotenvx/dotenvx";

await askEnv(
  {
    DATABASE_URL: z
      .string()
      .describe("Database connection URL")
      .default("my-connection"),
  },
  {
    path: ".env.x",
    channel: dotenvx,
  }
);
