import { define, schemas } from "@e-n-v/env";

const { NODE_ENV } = schemas;

export default define({
  schemas: { NODE_ENV },
  preprocess: {
    boolean: (value) => value === "true"
  },
});
