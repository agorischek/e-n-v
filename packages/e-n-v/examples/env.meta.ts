// env.meta.ts - Define your environment schema once

import define from "e-n-v/define";
import { z } from "zod";

export const env = define({
  path: ".env",
  root: import.meta.url,
  vars: {
    DATABASE_URL: z.string().url(),
    PORT: z.number().min(1024).max(65535),
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_KEY: z.string().min(32),
    DEBUG: z.boolean().optional(),
  },
  channel: { name: "default" }, // or { name: "process" }, { dotenvx }, etc.
});
