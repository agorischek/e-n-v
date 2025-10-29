export type { EnvChannel } from "@e-n-v/core";
export { DefaultEnvChannel } from "@e-n-v/channels/channels/default/DefaultEnvChannel";
export { DotEnvXChannel } from "@e-n-v/channels/channels/dotenvx/DotEnvXChannel";
export { ProcessEnvChannel } from "@e-n-v/channels/channels/processenv/ProcessEnvChannel";
export type { EnvChannelOptions } from "@e-n-v/channels/EnvChannelOptions";
export type { DotEnvXChannelConfig } from "@e-n-v/channels/channels/dotenvx/DotEnvXChannelConfig";
export type { DefaultChannelConfig } from "@e-n-v/channels/channels/default/DefaultChannelConfig";
export type {
  ProcessEnvChannelConfig,
  ProcessChannelConfig,
} from "@e-n-v/channels/channels/processenv/ProcessEnvChannelConfig";
export { resolveChannel } from "@e-n-v/channels/resolveChannel";

export * as defaults from "./options/defaults";

import { prompt } from "./prompt";
export { prompt };

export type { PromptEnvOptions } from "./options/PromptEnvOptions";
