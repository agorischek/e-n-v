export type { EnvChannel } from "@e-n-v/core";
export { DefaultEnvChannel } from "@e-n-v/channels/channels/default/DefaultEnvChannel";
export { DotEnvXChannel } from "@e-n-v/channels/channels/dotenvx/DotEnvXChannel";
export type { EnvChannelOptions } from "@e-n-v/channels/EnvChannelOptions";
export type { DotEnvXChannelConfig } from "@e-n-v/channels/channels/dotenvx/DotEnvXChannelConfig";
export type { DefaultChannelConfig } from "@e-n-v/channels/channels/default/DefaultChannelConfig";
export { resolveChannel } from "@e-n-v/channels/resolveChannel";

import { schema } from "@e-n-v/core";
export { schema };
export { schema as s };
export * as schemas from "@e-n-v/schemas";

export * as defaults from "./options/defaults";

import { prompt } from "./ask";
export { prompt };

export type { PromptEnvOptions } from "./options/PromptEnvOptions";

// Re-export EnvModel (EnvSpec is legacy alias)
export { EnvModel, EnvSpec, spec } from "@e-n-v/models";
export type { EnvModelOptions, EnvSpecOptions } from "@e-n-v/models";
