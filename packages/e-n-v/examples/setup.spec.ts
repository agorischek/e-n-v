// setup.ts - Interactive setup for missing environment variables

import spec from "./env.spec.js";
import { prompt, defaults } from "e-n-v";

// Interactive prompt to configure environment variables
await prompt({
  spec,
  secrets: [...defaults.SECRET_PATTERNS, "key"],
});

console.log("Environment setup complete!");
