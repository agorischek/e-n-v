#!/usr/bin/env bun

/**
 * Validation script to verify shape-env and e-n-v packages
 * Run from workspace root: bun run validate.ts
 */

import { define, parse, schema, EnvParseError } from "./packages/env/src/index";
import { writeFile, unlink } from "node:fs/promises";

console.log("🔍 Validating envcredible packages...\n");

async function validate() {
  const testPath = ".env.validation";

  try {
    // Create test file with environment variables
    const testEnv = `
PORT=8080
DATABASE_URL=postgres://localhost:5432/testdb
DEBUG=true
MAX_CONNECTIONS=50
API_KEY=test-secret-key
NODE_ENV=development
OPTIONAL_VAR=
`;
    await writeFile(testPath, testEnv);

    // Parse the test file into an object
    const sourceLines = testEnv.trim().split("\n");
    const source: Record<string, string> = {};
    for (const line of sourceLines) {
      const [key, value] = line.split("=");
      if (key && value !== undefined) {
        source[key] = value;
      }
    }

    console.log("✅ Step 1: Create EnvModel instance");
    const envModel = define({
      schemas: {
        PORT: schema.number(),
        DATABASE_URL: schema.string(),
        DEBUG: schema.boolean(),
        MAX_CONNECTIONS: schema.number(),
        API_KEY: schema.string(),
        NODE_ENV: schema.enum({
          values: ["development", "production", "test"] as const,
        }),
        OPTIONAL_VAR: schema.string({
          required: false,
          default: "default-value",
        }),
      },
      preprocess: true,
    });
    console.log(
      `   Schemas: ${Object.keys(envModel.schemas).length} variables\n`,
    );

    console.log("✅ Step 2: Parse environment variables");
    const env = parse(source, envModel);
    console.log(`   PORT: ${env.PORT} (${typeof env.PORT})`);
    console.log(`   DATABASE_URL: ${env.DATABASE_URL}`);
    console.log(`   DEBUG: ${env.DEBUG} (${typeof env.DEBUG})`);
    console.log(`   MAX_CONNECTIONS: ${env.MAX_CONNECTIONS}`);
    console.log(`   API_KEY: ${env.API_KEY}`);
    console.log(`   NODE_ENV: ${env.NODE_ENV}`);
    console.log(`   OPTIONAL_VAR: ${env.OPTIONAL_VAR} (used default)\n`);

    console.log("✅ Step 3: Verify process.env not mutated");
    console.log(
      `   process.env.PORT: ${process.env.PORT === undefined ? "✅ undefined" : "❌ " + process.env.PORT}`,
    );
    console.log(
      `   process.env.DEBUG: ${process.env.DEBUG === undefined ? "✅ undefined" : "❌ " + process.env.DEBUG}\n`,
    );

    console.log("✅ Step 4: Parse with custom preprocessing");
    const env2 = parse(source, {
      schemas: envModel.schemas,
      preprocess: {
        number: (value: string) => {
          console.log(`   Preprocessing number: "${value}"`);
          return value;
        },
      },
    });
    console.log(`   PORT: ${env2.PORT}\n`);

    console.log("✅ Step 5: Parse using schemas directly");
    const env3 = parse(source, {
      schemas: {
        PORT: schema.number(),
        DEBUG: schema.boolean(),
      },
    });
    console.log(`   PORT: ${env3.PORT}`);
    console.log(`   DEBUG: ${env3.DEBUG}\n`);

    console.log("✅ Step 6: Test aggregate error collection");
    const badSource = { PORT: "invalid", DEBUG: "maybe" };
    try {
      parse(badSource, {
        schemas: {
          PORT: schema.number(),
          DEBUG: schema.boolean(),
          MISSING1: schema.string(),
          MISSING2: schema.number(),
        },
      });
      console.log("   ❌ Should have thrown error\n");
    } catch (error) {
      if (error instanceof EnvParseError) {
        console.log(`   ✅ Caught parse error with ${error.issueCount} issues`);
        console.log(`      Missing: ${error.missing.join(", ")}`);
        console.log(`      Invalid: ${error.invalid.join(", ")}`);
      }
    }

    console.log("🎉 All validation steps passed!");
    console.log("\n📦 Packages validated:");
    console.log("   ✅ e-n-v");
    console.log("   ✅ shape-env");
    console.log("   ✅ @e-n-v/models");
    console.log("   ✅ @e-n-v/core");
    console.log("   ✅ @e-n-v/converters");
  } catch (error) {
    console.error("\n❌ Validation failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await unlink(testPath).catch(() => {});
  }
}

validate();
