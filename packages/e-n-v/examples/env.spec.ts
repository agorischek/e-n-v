// env.spec.ts - Define your environment schema once

import { spec } from "e-n-v";
import { z } from "zod";

export default spec({
  schemas: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().url(),
    PORT: z.number().min(1024).max(65535),
    API_KEY: z.string().min(32),
    DEBUG: z.boolean().optional(),
  },
  preprocess: true,
});
