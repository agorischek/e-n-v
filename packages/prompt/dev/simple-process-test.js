// Simple ProcessEnv channel implementation for testing
class ProcessEnvChannel {
  async get() {
    const env = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
    return env;
  }

  async set(values) {
    for (const [key, value] of Object.entries(values)) {
      process.env[key] = value;
    }
  }
}

// Test the ProcessEnvChannel
async function testProcessEnvChannel() {
  console.log("Testing ProcessEnvChannel...\n");
  
  const channel = new ProcessEnvChannel();
  
  // Get current environment variables
  console.log("Getting current environment variables:");
  const env = await channel.get();
  console.log(`Found ${Object.keys(env).length} environment variables`);
  console.log("NODE_ENV:", env.NODE_ENV || "(not set)");
  console.log("PATH exists:", "PATH" in env);
  
  // Set some test variables
  console.log("\nSetting test variables...");
  await channel.set({
    TEST_VAR: "test_value",
    ANOTHER_TEST: "another_value"
  });
  
  // Verify they were set
  console.log("TEST_VAR in process.env:", process.env.TEST_VAR);
  console.log("ANOTHER_TEST in process.env:", process.env.ANOTHER_TEST);
  
  // Get them back through the channel
  const updatedEnv = await channel.get();
  console.log("TEST_VAR via channel:", updatedEnv.TEST_VAR);
  console.log("ANOTHER_TEST via channel:", updatedEnv.ANOTHER_TEST);
  
  console.log("\nProcessEnvChannel test completed successfully! ✅");
}

testProcessEnvChannel().catch(console.error);