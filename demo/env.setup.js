import { prompt, schemas } from "../packages/bundle/dist/bundle.cjs";
const { PORT, NODE_ENV, API_KEY } = schemas;

await prompt({
  channel: { process },
  schemas: { PORT, NODE_ENV, API_KEY },
});
    