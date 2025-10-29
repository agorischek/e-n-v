import { define, schemas } from "../packages/env/dist/bundle.js";
const { PORT, NODE_ENV, API_KEY } = schemas;

export default define({
  schemas: { PORT, NODE_ENV, API_KEY },
});
