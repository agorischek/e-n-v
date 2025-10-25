import {
  load,
  schema,
  MissingEnvVarError,
  ValidationError,
  EnvValidationAggregateError,
} from "../src/index";
import { writeFile, unlink } from "node:fs/promises";

async function demo() {
  const testPath = ".env.errors-demo";

  try {
    // Create a demo .env file with some issues
    await writeFile(
      testPath,
      `PORT=not-a-number
DEBUG=maybe
`
    );

    console.log("🔍 Demo: Error Handling\n");

    // Test 1: Multiple errors collected in aggregate
    console.log("Test 1: Multiple validation errors (aggregate)");
    try {
      await load({
        path: testPath,
        vars: {
          PORT: schema.number(),
          DEBUG: schema.boolean(),
          REQUIRED_KEY1: schema.string(),
          REQUIRED_KEY2: schema.number(),
        },
      });
    } catch (error) {
      if (error instanceof EnvValidationAggregateError) {
        console.log(`  ❌ EnvValidationAggregateError: ${error.errors.length} errors`);
        console.log(`     Missing vars: ${error.missingVars.join(", ")}`);
        console.log(`     Invalid vars: ${error.invalidVars.join(", ")}`);
        console.log(`\n     Full message:\n${error.message}\n`);
      }
    }

    // Test 2: Missing required variable (strict mode)
    console.log("Test 2: Missing required variable (strict mode)");
    try {
      await load({
        path: testPath,
        vars: {
          REQUIRED_KEY: schema.string(),
        },
      });
    } catch (error) {
      if (error instanceof EnvValidationAggregateError) {
        console.log(`  ❌ Aggregate error with ${error.errors.length} error(s)`);
        console.log(`     Missing: ${error.missingVars.join(", ")}\n`);
      }
    }

    // Test 3: Missing required variable (non-strict mode)
    // Test 3: Missing required variable (non-strict mode)
    console.log("Test 3: Missing required variable (non-strict mode)");
    const env2 = await load(
      {
        path: testPath,
        vars: {
          REQUIRED_KEY: schema.string(),
        },
      },
      { strict: false }
    );
    console.log(`  ✅ Returned undefined: ${env2.REQUIRED_KEY}\n`);

    // Test 4: Validation error details
    console.log("Test 4: Detailed error messages");
    try {
      await load({
        path: testPath,
        vars: {
          PORT: schema.number(),
          DEBUG: schema.boolean(),
        },
      });
    } catch (error) {
      if (error instanceof EnvValidationAggregateError) {
        console.log(`  ❌ Detailed messages:`);
        console.log(error.getDetailedMessage());
        console.log();
      }
    }

    // Test 5: Using defaults to avoid errors
    console.log("Test 5: Using defaults to avoid errors");
    const env5 = await load({
      path: testPath,
      vars: {
        MISSING_VAR: schema.string({ default: "fallback", required: false }),
      },
    });
    console.log(`  ✅ Used default: ${env5.MISSING_VAR}\n`);

    console.log("✅ Error handling demo complete!");
  } finally {
    // Clean up
    await unlink(testPath).catch(() => {});
  }
}

demo();
