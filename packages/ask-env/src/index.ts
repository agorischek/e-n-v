export type { EnvChannel } from "@envcredible/core";
export { DefaultEnvChannel } from "@envcredible/channels/channels/default/DefaultEnvChannel";
export { DotEnvXChannel } from "@envcredible/channels/channels/dotenvx/DotEnvXChannel";
export type { EnvChannelOptions } from "@envcredible/channels/EnvChannelOptions";
export type { DotEnvXChannelConfig } from "@envcredible/channels/channels/dotenvx/DotEnvXChannelConfig";
export type { DefaultChannelConfig } from "@envcredible/channels/channels/default/DefaultChannelConfig";
export { resolveChannel } from "@envcredible/channels/resolveChannel";

import { schema } from "@envcredible/core";
export { schema };
export { schema as s };
export * as schemas from "../../env-var-schemas/src";

export * as defaults from "./options/defaults";

export { ask } from "./ask";
export type { AskEnvOptions } from "./options/AskEnvOptions";
