import { ask } from "../src";

await ask({
  DEMO: {
    type: "string",
    description: "Demo variable",
    required: true,
    default: "hello",
    validate: (value: string) => {
      if (value?.length && value.length < 3) {
        return "Must be at least 3 characters";
      }
    },
  },
});
