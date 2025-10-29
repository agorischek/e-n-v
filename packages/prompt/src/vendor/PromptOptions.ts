import type { Prompt } from "@clack/core";
import { Readable, Writable } from "node:stream";

export type Validate<TValue> = (
  value: TValue | undefined,
) => string | Error | undefined;

export type Process<TValue> = (value: string) => TValue | undefined;

export interface PromptOptions<TValue, Self extends Prompt<TValue>> {
  render(this: Omit<Self, "prompt">): string | undefined;
  initialValue?: any;
  initialUserInput?: string;
  validate?: Validate<TValue> | undefined;
  input?: Readable;
  output?: Writable;
  debug?: boolean;
  signal?: AbortSignal;
}
