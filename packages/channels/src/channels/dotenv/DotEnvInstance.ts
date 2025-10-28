export interface DotEnvConfigOptions {
  path?: string;
  encoding?: string;
  debug?: boolean;
  override?: boolean;
  [key: string]: unknown;
}

export interface DotEnvConfigOutput {
  parsed?: Record<string, string>;
  error?: Error;
}

export interface DotEnvParseOptions {
  debug?: boolean;
  [key: string]: unknown;
}

export interface DotEnvInstance {
  parse(
    src: string | Buffer,
    options?: DotEnvParseOptions,
  ): Record<string, string | undefined>;
  config?(options?: DotEnvConfigOptions): DotEnvConfigOutput;
}
