import type { TypedEnvVarSchema } from "@envcredible/core";
import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";

export type SupportedSchema = ZodTypeAny | $ZodType | TypedEnvVarSchema;