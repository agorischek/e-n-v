import type { EnvVarSchema, EnvChannel, PreprocessorOptions } from "@envcredible/core";
import type { Theme } from "../visuals/Theme";

export interface SessionOptions {
  schemas: Record<string, EnvVarSchema>;
  channel: EnvChannel;
  secrets: readonly (string | RegExp)[];
  truncate: number;
  theme: Theme;
  input?: Readable;
  output: NodeJS.WriteStream;
  path: string;
  preprocessorOptions?: PreprocessorOptions;
}