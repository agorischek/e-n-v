import { prompt, schemas, defaults } from "../src";
const { NODE_ENV, PORT, OPENAI_API_KEY } = schemas;

await prompt({
  vars: { NODE_ENV, PORT, OPENAI_API_KEY },
  secrets: [...defaults.SECRET_PATTERNS],
});
