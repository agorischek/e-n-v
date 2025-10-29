import { prompt, schemas } from "../packages/env/dist/bundle.js";
const { PORT, NODE_ENV, API_KEY } = schemas;

await prompt({
  channel: { process },
  schemas: { PORT, NODE_ENV, API_KEY },
});
