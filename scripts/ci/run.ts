#!/usr/bin/env bun

/**
 * CI script that runs all checks and reports results clearly
 */

import { steps } from "./steps";

const results: { name: string; success: boolean; duration: number }[] = [];

console.log("\n🚀 Running CI checks...\n");

for (const step of steps) {
  const start = performance.now();
  console.log(`▶️  ${step.name}...`);

  const proc = Bun.spawn(step.command.split(" "), {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  const duration = Math.round(performance.now() - start);
  const success = exitCode === 0;

  results.push({ name: step.name, success, duration });

  if (success) {
    console.log(`✅ ${step.name} passed (${duration}ms)\n`);
  } else {
    console.log(`❌ ${step.name} failed (${duration}ms)\n`);
  }
}

// Print summary
console.log("\n" + "=".repeat(50));
console.log("CI SUMMARY");
console.log("=".repeat(50));

for (const result of results) {
  const status = result.success ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} - ${result.name} (${result.duration}ms)`);
}

const allPassed = results.every((r) => r.success);
const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

console.log("=".repeat(50));

if (allPassed && results.length === steps.length) {
  console.log(`\n🎉 All checks passed! Total time: ${totalDuration}ms\n`);
  process.exit(0);
} else {
  const failedStep = results.find((r) => !r.success);
  console.log(`\n💥 CI failed at: ${failedStep?.name || "unknown"}\n`);
  process.exit(1);
}
