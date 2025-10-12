import { z } from "zod";
import {
  descriptions,
  constraints,
  messages,
} from "../../../shared/applicationInsights";

const schema = z
  .string()
  .describe(descriptions.roleName)
  .min(constraints.roleNameMin, { error: messages.roleNameMin })
  .max(constraints.roleNameMax, { error: messages.roleNameMax });

export const appInsightsRoleNameSchema = schema;
export const APPINSIGHTS_ROLE_NAME = appInsightsRoleNameSchema;
