import { define, schemas } from "../packages/bundle/dist/bundle.js";
const { PORT, NODE_ENV, API_KEY } = schemas;

export default define({
  schemas: { PORT, NODE_ENV, API_KEY },
});
    