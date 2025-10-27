// Try importing directly from the resolved paths
import { model } from "../../../packages/env/src/index.js";
import { parse } from "../../../packages/parse/src/index.js";
import { z } from "zod";

const testModel = model({
  schemas: {
    PORT: z.number(),
    DEBUG: z.boolean().default(false),
  },
  preprocess: true,
});

const result = parse(process.env, testModel);
const { PORT, DEBUG } = result;

// This should show the correct types
console.log(`PORT type: ${typeof PORT}, DEBUG type: ${typeof DEBUG}`);
