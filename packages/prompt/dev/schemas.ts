import { prompt, defaults } from "../src";
import * as schemas from "@e-n-v/schemas";
 const { NODE_ENV, PORT, OPENAI_API_KEY } = schemas;

await prompt({
  schemas: { NODE_ENV, PORT, OPENAI_API_KEY },
  secrets: [...defaults.SECRET_PATTERNS],
});
