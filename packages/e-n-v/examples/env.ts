// env.ts - Load and validate environment variables at runtime

import { load } from "e-n-v";
import { env } from "./env.meta";

// Load and destructure - fully type-safe!
export const { DATABASE_URL, PORT, NODE_ENV, API_KEY, DEBUG } = await load(env);

// Alternative: load with custom options
// export const config = await load(env, {
//   strict: false, // allow missing/invalid vars
//   preprocess: {
//     number: (value) => value.replace(/,/g, ""), // strip commas
//   },
// });
