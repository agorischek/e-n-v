import type { Formatter } from "picocolors/types";
import type { EnvChannelOptions } from "./channels/EnvChannelOptions";
import type { SecretPattern } from "./types";

export type AskEnvOptions = {
  path?: string;
  channel?: EnvChannelOptions;
  truncate?: number;
  secrets?: Array<SecretPattern>;
  theme?: Formatter;
};