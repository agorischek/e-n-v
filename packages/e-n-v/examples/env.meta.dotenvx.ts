// env.meta.dotenvx.ts - Example using dotenvx channel

import define from "e-n-v/define";
import { z } from "zod";
import * as dotenvx from "@dotenvx/dotenvx";

export const env = define({
  path: ".env.vault",
  root: import.meta.url,
  vars: {
    DATABASE_URL: z.string().url(),
    SECRET_KEY: z.string(),
    API_TOKEN: z.string(),
  },
  channel: {
    dotenvx,
    get: {
      privateKey: process.env.DOTENV_PRIVATE_KEY,
    },
  },
});
