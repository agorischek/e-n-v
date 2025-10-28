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
