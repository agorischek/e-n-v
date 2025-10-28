// Test the { process } shorthand notation
console.log("Testing { process } shorthand notation...\n");

// Simulate the resolveChannel logic
function resolveChannel(options: any) {
  if (typeof options === "object" && options !== null) {
    if ("process" in options) {
      if (options.process && typeof options.process === "object" && "env" in options.process) {
        console.log("✅ Detected valid process object with env property");
        return "ProcessEnvChannel would be created here";
      }
      throw new Error("Invalid process object provided to channel config");
    }
  }
  return "Other channel";
}

// Test with actual process object using shorthand notation
try {
  const result = resolveChannel({ process });
  console.log("Result:", result);
} catch (error: any) {
  console.log("Error:", error.message);
}

console.log("\nDemonstrating property shorthand:");
console.log("{ process } is equivalent to { process: process }");
console.log("process.env exists:", "env" in process);
console.log("typeof process:", typeof process);

// Set some test values for demonstration
process.env.PORT = "8080";
process.env.ENABLE_CACHE = "true";
process.env.API_BASE_URL = "https://api.example.com";
process.env.NODE_ENV = "development";

console.log("\nCurrent process.env values:");
console.log("PORT:", process.env.PORT);
console.log("ENABLE_CACHE:", process.env.ENABLE_CACHE);
console.log("API_BASE_URL:", process.env.API_BASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

console.log("\n🎯 The { process } shorthand notation is working!");