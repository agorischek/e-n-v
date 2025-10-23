import type { EnvVarSchema, EnvChannel, Preprocessors } from "@envcredible/core";
import type { Theme } from "../visuals/Theme";
import { Readable, Writable } from "node:stream";

export interface SessionOptions {
  schemas: Record<string, EnvVarSchema>;
  channel: EnvChannel;
  secrets: readonly (string | RegExp)[];
  truncate: number;
  theme: Theme;
  input?: Readable;
  output?: Writable;
  path: string;
  preprocessorOptions?: Preprocessors;
}