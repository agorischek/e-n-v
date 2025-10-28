import type {
  DotEnvConfigOptions,
  DotEnvInstance,
  DotEnvParseOptions,
} from "./DotEnvInstance";

export interface DotEnvChannelConfig {
  dotenv: DotEnvInstance;
  path?: string;
  get?: DotEnvConfigOptions & { [key: string]: unknown };
  parse?: DotEnvParseOptions & { [key: string]: unknown };
}
