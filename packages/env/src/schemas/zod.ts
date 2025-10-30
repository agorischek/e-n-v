// @e-n-v/env/schemas/zod
import * as zodSchemas from "@e-n-v/schemas/zod/v4";
import { z } from "zod";

// Default export: all Zod schemas instantiated with z
export default zodSchemas.default(z);

// Re-export all named Zod schemas
export * from "@e-n-v/schemas/zod";
