import { parse, s } from "../src/index";
import { define } from "@e-n-v/env";

const env = parse(
  {
    PORT: "3000",
  },
  define({
    schemas: {
      PORT: s.number({ default: 3000 }),
    },
  })
);

// This should cause a TypeScript error
// @ts-expect-error
const wrongType: string = env.PORT;

console.log("This shouldn't compile!");