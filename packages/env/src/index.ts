// Main exports
import { parse } from "@e-n-v/parse";
import { prompt } from "@e-n-v/prompt";
import { define } from "@e-n-v/models";
import vars from "./vars";
import { schema, s } from "@e-n-v/core";

// Re-export for named exports
export { parse, prompt, define, vars };
export { schema, s };
export * as schemas from "@e-n-v/schemas";

// Export processors and preprocessors from core
export { processors, preprocessors } from "@e-n-v/core";

// Default export
export default { parse, prompt, define };
