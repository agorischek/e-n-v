import type { Prompt } from "@clack/core";
import { Readable, Writable } from 'node:stream';

export interface PromptOptions<TValue, Self extends Prompt<TValue>> {
    render(this: Omit<Self, 'prompt'>): string | undefined;
    initialValue?: any;
    initialUserInput?: string;
    validate?: ((value: TValue | undefined) => string | Error | undefined) | undefined;
    input?: Readable;
    output?: Writable;
    debug?: boolean;
    signal?: AbortSignal;
}