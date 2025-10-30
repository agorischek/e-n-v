#!/usr/bin/env bun

/**
 * CI script that runs all checks and reports results clearly
 */

import { file } from "bun";
import { existsSync } from "fs";
import { join } from "path";

interface CheckStep {
  name: string;
  command: string;
}

interface Config {
  skipSteps?: string[];
  path?: string;
}

interface CIYaml {
  jobs: {
    ci: {
      steps: Array<{
        name: string;
        run?: string;
        uses?: string;
      }>;
    };
  };
}

// Load configuration
const configPath = join(import.meta.dir, "config.yaml");
let config: Config = { path: ".github/workflows/ci.yml", skipSteps: [] };

if (existsSync(configPath)) {
  const configFile = file(configPath);
  const configContent = await configFile.text();
  const parsedConfig = Bun.YAML.parse(configContent) as Config;
  config = { ...config, ...parsedConfig };
}

// Load CI YAML file
const ciYamlPath = join(
  process.cwd(),
  config.path || ".github/workflows/ci.yml",
);

if (!existsSync(ciYamlPath)) {
  console.error(`❌ CI YAML file not found at: ${ciYamlPath}`);
  process.exit(1);
}

const ciYamlFile = file(ciYamlPath);
const ciYamlContent = await ciYamlFile.text();
const ciYaml = Bun.YAML.parse(ciYamlContent) as CIYaml;

// Extract steps with run commands
const steps: CheckStep[] = ciYaml.jobs.ci.steps
  .filter((step) => step.run && step.name)
  .map((step) => ({
    name: step.name,
    command: step.run!,
  }))
  .filter((step) => !config.skipSteps?.includes(step.name));

console.log(`\n📄 Loaded ${steps.length} steps from ${config.path}`);
if (config.skipSteps && config.skipSteps.length > 0) {
  console.log(`⏭️  Skipping: ${config.skipSteps.join(", ")}`);
}

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
