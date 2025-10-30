import vars, { NODE_ENV, PORT, DEBUG } from "@e-n-v/env/vars";

// Example usage of the sugar helper
export default vars({ NODE_ENV, PORT, DEBUG });

// Test the syntax you requested
const model = vars({ NODE_ENV });

console.log("Model created successfully:", model);