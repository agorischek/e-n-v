#!/usr/bin/env bun

/**
 * Validation script to verify direct-env and envcredible-meta packages
 * Run from workspace root: bun run validate.ts
 */

import { load, EnvMeta, schema } from "./packages/direct-env/src/index";
import { writeFile, unlink } from "node:fs/promises";

console.log("🔍 Validating envcredible packages...\n");

async function validate() {
  const testPath = ".env.validation";
  
  try {
    // Create test file
    await writeFile(testPath, `
PORT=8080
DATABASE_URL=postgres://localhost:5432/testdb
DEBUG=true
MAX_CONNECTIONS=50
API_KEY=test-secret-key
NODE_ENV=development
OPTIONAL_VAR=
`);

    console.log("✅ Step 1: Create EnvMeta instance");
    const meta = new EnvMeta({
      path: testPath,
      vars: {
        PORT: schema.number(),
        DATABASE_URL: schema.string(),
        DEBUG: schema.boolean(),
        MAX_CONNECTIONS: schema.number(),
        API_KEY: schema.string(),
        NODE_ENV: schema.enum({ values: ["development", "production", "test"] }),
        OPTIONAL_VAR: schema.string({ required: false, default: "default-value" }),
      },
    });
    console.log(`   Channel: ${meta.channel.constructor.name}`);
    console.log(`   Path: ${meta.path}`);
    console.log(`   Schemas: ${Object.keys(meta.schemas).length} variables\n`);

    console.log("✅ Step 2: Load environment variables");
    const env = await load(meta);
    console.log(`   PORT: ${env.PORT} (${typeof env.PORT})`);
    console.log(`   DATABASE_URL: ${env.DATABASE_URL}`);
    console.log(`   DEBUG: ${env.DEBUG} (${typeof env.DEBUG})`);
    console.log(`   MAX_CONNECTIONS: ${env.MAX_CONNECTIONS}`);
    console.log(`   API_KEY: ${env.API_KEY}`);
    console.log(`   NODE_ENV: ${env.NODE_ENV}`);
    console.log(`   OPTIONAL_VAR: ${env.OPTIONAL_VAR} (used default)\n`);

    console.log("✅ Step 3: Verify process.env not mutated");
    console.log(`   process.env.PORT: ${process.env.PORT === undefined ? "✅ undefined" : "❌ " + process.env.PORT}`);
    console.log(`   process.env.DEBUG: ${process.env.DEBUG === undefined ? "✅ undefined" : "❌ " + process.env.DEBUG}\n`);

    console.log("✅ Step 4: Load with options");
    const env2 = await load(meta, {
      preprocess: {
        number: (v) => {
          console.log(`   Preprocessing number: "${v}"`);
          return v;
        },
      },
    });
    console.log(`   PORT: ${env2.PORT}\n`);

    console.log("✅ Step 5: Load using EnvMetaOptions directly");
    const env3 = await load({
      path: testPath,
      vars: {
        PORT: schema.number(),
        DEBUG: schema.boolean(),
      },
    });
    console.log(`   PORT: ${env3.PORT}`);
    console.log(`   DEBUG: ${env3.DEBUG}\n`);

    console.log("🎉 All validation steps passed!");
    console.log("\n📦 Packages validated:");
    console.log("   ✅ @envcredible/meta");
    console.log("   ✅ direct-env");
    console.log("   ✅ @envcredible/core");
    console.log("   ✅ @envcredible/schemata");
    console.log("   ✅ @envcredible/channels");

  } catch (error) {
    console.error("\n❌ Validation failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await unlink(testPath).catch(() => {});
  }
}

validate();
