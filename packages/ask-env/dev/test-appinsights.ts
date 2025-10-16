import { z } from "zod";
import { ask } from "../src/ask";

// Simulate having a very long Application Insights connection string in the environment
process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=6f15a2b0-1e6e-4f3e-bb8a-1e05f29a0abc;IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/";

const schemas = {
  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().describe("Azure Application Insights connection string"),
};

console.log("Testing with current very long connection string:");
console.log("Expected truncation at 40 characters: 'InstrumentationKey=6f15a2b0-1e6e-4f3e-bb8a-...'");
console.log();

await ask(schemas, {
  path: ".env.test-appinsights"
});

console.log("\nTesting with custom 30 character limit:");
await ask(schemas, {
  path: ".env.test-appinsights-30",
  truncate: 30
});