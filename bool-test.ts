#!/usr/bin/env bun
import { booleanPrompt, isCancel } from "./boolean-prompt";
import color from "picocolors";

async function testBooleanPrompt() {
  console.log(color.cyan("\n🔧 Boolean Prompt Testing\n"));

  // Test 1: Basic required boolean
  console.log(color.yellow("Test 1: Basic required boolean"));
  const result1 = await booleanPrompt({
    key: "ENABLE_LOGGING",
    description: "Enable application logging",
    optional: false,
  });

  if (isCancel(result1)) {
    console.log(color.red("Cancelled!"));
    return;
  }
  console.log(color.dim(`Result: ${result1}\n`));

  // Test 2: Optional boolean with current value
  console.log(color.yellow("Test 2: Optional with current value"));
  const result2 = await booleanPrompt({
    key: "DEBUG_MODE",
    description: "Enable debug mode for development",
    current: true,
    optional: true,
  });

  if (isCancel(result2)) {
    console.log(color.red("Cancelled!"));
    return;
  }
  console.log(color.dim(`Result: ${result2} (null means skipped)\n`));

  // Test 3: Boolean with default value
  console.log(color.yellow("Test 3: Required with default value"));
  const result3 = await booleanPrompt({
    key: "USE_HTTPS",
    description: "Use HTTPS for secure connections",
    default: true,
    optional: false,
  });

  if (isCancel(result3)) {
    console.log(color.red("Cancelled!"));
    return;
  }
  console.log(color.dim(`Result: ${result3}\n`));

  // Test 4: All options (current, default, optional)
  console.log(color.yellow("Test 4: Current value, default, and optional"));
  const result4 = await booleanPrompt({
    key: "SEND_ANALYTICS",
    description: "Send anonymous usage analytics to help improve the product",
    current: false,
    default: true,
    optional: true,
  });

  if (isCancel(result4)) {
    console.log(color.red("Cancelled!"));
    return;
  }
  console.log(color.dim(`Result: ${result4}\n`));

  // Test 5: No description, just the key
  console.log(color.yellow("Test 5: Minimal - just key and required"));
  const result5 = await booleanPrompt({
    key: "PRODUCTION_MODE",
    optional: false,
  });

  if (isCancel(result5)) {
    console.log(color.red("Cancelled!"));
    return;
  }
  console.log(color.dim(`Result: ${result5}\n`));

  // Test 6: Optional with no current or default
  console.log(color.yellow("Test 6: Optional with no current/default"));
  const result6 = await booleanPrompt({
    key: "EXPERIMENTAL_FEATURES",
    description: "Enable experimental features (may be unstable)",
    optional: true,
  });

  if (isCancel(result6)) {
    console.log(color.red("Cancelled!"));
    return;
  }
  console.log(color.dim(`Result: ${result6}\n`));

  // Summary
  console.log(color.green("🎉 All tests completed!"));
  console.log(color.dim("\nResults summary:"));
  console.log(color.dim(`ENABLE_LOGGING: ${result1}`));
  console.log(color.dim(`DEBUG_MODE: ${result2}`));
  console.log(color.dim(`USE_HTTPS: ${result3}`));
  console.log(color.dim(`SEND_ANALYTICS: ${result4}`));
  console.log(color.dim(`PRODUCTION_MODE: ${result5}`));
  console.log(color.dim(`EXPERIMENTAL_FEATURES: ${result6}`));

  console.log(color.cyan("\nBoolean Prompt Features Demonstrated:"));
  console.log(color.dim("✓ True/False/Skip options with icons"));
  console.log(color.dim("✓ Current value display"));
  console.log(color.dim("✓ Default value display"));
  console.log(color.dim("✓ Optional vs required prompts"));
  console.log(color.dim("✓ Rich descriptions"));
  console.log(color.dim("✓ Color-coded results"));
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log(color.red("\n\nGoodbye! 👋"));
  process.exit(0);
});

if (import.meta.main) {
  testBooleanPrompt().catch(console.error);
}
