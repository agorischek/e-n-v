// setup.ts - Interactive setup for missing environment variables

import model from "./src/env/env.model.js";
import { prompt, defaults } from "@e-n-v/env";

// Interactive prompt to configure environment variables
await prompt({
  model,
  secrets: [...defaults.SECRET_PATTERNS, "key"],
});

console.log("Environment setup complete!");
