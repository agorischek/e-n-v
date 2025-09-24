#!/usr/bin/env bun
import { booleanPrompt, isCancel } from "./BooleanPrompt";
import color from "picocolors";

async function testBooleanPrompt() {
  console.log(color.yellow("Test 1: Basic required boolean"));
  const result1 = await booleanPrompt({
    key: "ENABLE_LOGGING",
    description: "Enable application logging",
    optional: false,
  });

  const result2 = await booleanPrompt({
    key: "DEBUG_MODE",
    description: "Enable debug mode for development",
    current: true,
    optional: true,
  });

  const result3 = await booleanPrompt({
    key: "USE_HTTPS",
    description: "Use HTTPS for secure connections",
    default: true,
    optional: false,
  });

  const result4 = await booleanPrompt({
    key: "SEND_ANALYTICS",
    description: "Send anonymous usage analytics to help improve the product",
    current: false,
    default: true,
    optional: true,
  });

  const result5 = await booleanPrompt({
    key: "PRODUCTION_MODE",
    optional: false,
  });

  const result6 = await booleanPrompt({
    key: "EXPERIMENTAL_FEATURES",
    description: "Enable experimental features (may be unstable)",
    optional: true,
  });
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log(color.red("\n\nGoodbye! 👋"));
  process.exit(0);
});

if (import.meta.main) {
  testBooleanPrompt().catch(console.error);
}
