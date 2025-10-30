/**
 * Example showing the sugar helper usage pattern
 */
import vars, { NODE_ENV, PORT, DEBUG, DATABASE_URL } from "@e-n-v/env/vars";

// Simple usage - just NODE_ENV as requested
export const simpleModel = vars({ NODE_ENV });

// More comprehensive usage
export const fullModel = vars({ 
  NODE_ENV, 
  PORT, 
  DEBUG, 
  DATABASE_URL 
});

// You can also mix predefined schemas with custom ones
import { s } from "@e-n-v/core";

export const mixedModel = vars({
  NODE_ENV,
  PORT,
  CUSTOM_VAR: s.string({ default: "custom-value" })
});

export default vars({ NODE_ENV });