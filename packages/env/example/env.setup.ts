// setup.ts - Interactive setup for missing environment variables

import { model } from "./src/env/env.model.js";
import { prompt, defaults } from "@e-n-v/env";

await prompt(model, {
  root: import.meta.url,
  secrets: [...defaults.SECRET_PATTERNS, "key"],
});
