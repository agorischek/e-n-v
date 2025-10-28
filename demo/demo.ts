import dotenv from "dotenv";
import { prompt, schemas } from "../packages/env/src";
const { PORT, NODE_ENV, API_KEY } = schemas;

await prompt({
  path: ".env",
  root: import.meta.url,
  schemas: { PORT, NODE_ENV, API_KEY },
  channel: {dotenv}
});
