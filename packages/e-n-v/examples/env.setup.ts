// env.setup.ts - Interactive setup script for development

import { setup, defaults } from "e-n-v";
import { env } from "./env.meta";
import * as color from "picocolors";

await setup(env, {
  theme: color.cyan,
  secrets: [...defaults.secrets, "API_KEY"],
  truncate: 50,
});

console.log("\n✅ Environment setup complete!");
console.log(
  "You can now run your application with the configured environment.\n",
);
