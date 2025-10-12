import { z } from "zod";
import {
  defaults,
  descriptions,
  constraints,
  messages,
} from "../../../shared/applicationInsights";

const schema = z
  .number()
  .describe(descriptions.samplingRate)
  .min(constraints.samplingRateMin, { error: messages.samplingRateMin })
  .max(constraints.samplingRateMax, { error: messages.samplingRateMax })
  .default(defaults.samplingRate);

export const appInsightsSamplingRateSchema = schema;
export const APPINSIGHTS_SAMPLING_RATE = appInsightsSamplingRateSchema;
