// env.spec.ts - Define your environment schema once

import { model } from "e-n-v";
import { z } from "zod";

export default model({
  schemas: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.url(),
    PORT: z.number().min(1024).max(65535),
    API_KEY: z.string().min(32),
    DEBUG: z.boolean().optional(),
  },
  preprocess: true,
});
