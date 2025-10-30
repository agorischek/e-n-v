// Simple test to verify the vars helper syntax works
import vars, { NODE_ENV } from "../packages/env/src/vars";

console.log("Testing vars helper...");

// Test the exact syntax from the user request
const model = vars({ NODE_ENV });

console.log("✅ Successfully created model with vars({ NODE_ENV })");
console.log("Model schemas:", Object.keys(model.schemas));
console.log("NODE_ENV schema type:", model.schemas.NODE_ENV.type);

// Test with multiple vars
import { PORT, DEBUG } from "../packages/env/src/vars";
const multiModel = vars({ NODE_ENV, PORT, DEBUG });

console.log("✅ Successfully created model with multiple vars");
console.log("Multi-model schemas:", Object.keys(multiModel.schemas));