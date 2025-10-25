import { load, schema, MissingEnvVarError, ValidationError } from "../src/index";
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

    // Test 1: Missing required variable
    console.log("Test 1: Missing required variable (strict mode)");
    try {
      await load({
        path: testPath,
        vars: {
          REQUIRED_KEY: schema.string(),
        },
      });
    } catch (error) {
      if (error instanceof MissingEnvVarError) {
        console.log(`  ❌ MissingEnvVarError: ${error.message}`);
        console.log(`     Key: ${error.key}\n`);
      }
    }

    // Test 2: Missing required variable (non-strict mode)
    console.log("Test 2: Missing required variable (non-strict mode)");
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

    // Test 3: Invalid number
    console.log("Test 3: Invalid number validation");
    try {
      await load({
        path: testPath,
        vars: {
          PORT: schema.number(),
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(`  ❌ ValidationError: ${error.message}`);
        console.log(`     Key: ${error.key}`);
        console.log(`     Value: ${error.value}`);
        console.log(`     Original: ${error.originalError}\n`);
      }
    }

    // Test 4: Invalid boolean
    console.log("Test 4: Invalid boolean validation");
    try {
      await load({
        path: testPath,
        vars: {
          DEBUG: schema.boolean(),
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(`  ❌ ValidationError: ${error.message}`);
        console.log(`     Key: ${error.key}`);
        console.log(`     Value: ${error.value}\n`);
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
