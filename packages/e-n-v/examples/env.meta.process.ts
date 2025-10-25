// env.meta.process.ts - Example using process.env channel

import define, { schema } from "e-n-v/define";

export const env = define({
  path: ".env", // path is ignored when using process channel
  vars: {
    PORT: schema.number({ default: 3000 }),
    NODE_ENV: schema.enum({
      values: ["development", "production", "test"] as const,
      default: "development",
    }),
    DEBUG: schema.boolean({ default: false }),
  },
  channel: { name: "process" }, // reads from process.env
});
