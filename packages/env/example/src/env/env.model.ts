// env.model.ts - Define your environment schema once

import { define } from "@e-n-v/env";
import { z } from "zod";

export const model = define({
  schemas: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.url(),
    PORT: z.number().min(1024).max(65535),
    API_KEY: z.string().min(32),
    DEBUG: z.boolean().default(false),
  },
  preprocess: true,
});

export default model;
