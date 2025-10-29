import { parse, s } from "../src";

const source = {
  APP_NAME: "envcredible",
  RETRIES: "3",
  ENABLE_CACHE: "true",
  LOG_LEVEL: "info",
};

const env = parse(source, {
  schemas: {
    APP_NAME: s.string(),
    RETRIES: s.number(),
    ENABLE_CACHE: s.boolean(),
    LOG_LEVEL: s.enum({ values: ["debug", "info", "warn", "error"] as const }),
  },
  preprocess: true,
});

// void (env satisfies {
//   APP_NAME: string;
//   RETRIES: number;
//   ENABLE_CACHE: boolean;
//   LOG_LEVEL: "debug" | "info" | "warn" | "error";
// });

console.log("✅ Built-in schemas inferred types:", {
  appName: env.APP_NAME,
  retries: env.RETRIES,
  enableCache: env.ENABLE_CACHE,
  logLevel: env.LOG_LEVEL,
});
