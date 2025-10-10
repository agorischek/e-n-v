import { Readable, Writable } from "node:stream";
import type { Key } from "node:readline";

export class TestWritable extends Writable {
  public readonly writes: Array<string | Buffer> = [];

  override _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.writes.push(typeof chunk === "string" ? chunk : Buffer.from(chunk, encoding));
    callback();
  }
}

export function createTestStreams() {
  const input = new Readable({ read() {} });
  const output = new TestWritable();
  return { input, output } as const;
}

export const baseKey = (partial: Partial<Key>): Key =>
  ({
    name: undefined,
    ctrl: false,
    meta: false,
    shift: false,
    sequence: undefined,
    code: undefined,
    ...partial,
  } as Key);

export async function waitForIO(ticks = 1): Promise<void> {
  for (let index = 0; index < ticks; index++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}

export function emitKey(
  prompt: { input: Readable },
  options: Partial<Key>,
  char?: string,
): void {
  const key = baseKey(options);
  (prompt.input as Readable & { emit: (event: string, ...args: any[]) => boolean }).emit(
    "keypress",
    char,
    key,
  );
}

export async function typeText(
  prompt: { rl?: any; input: Readable },
  text: string,
): Promise<void> {
  for (const char of text) {
    emitKey(prompt, { name: undefined, sequence: char }, char);
    await waitForIO();
  }
}

export function submitPrompt(prompt: { rl?: { write: (data: string | null, key?: Key) => void }; input: Readable }): void {
  emitKey(prompt, { name: "return" }, "\r");
}

export function cancelPrompt(prompt: { rl?: { write: (data: string | null, key?: Key) => void }; input: Readable }): void {
  emitKey(prompt, { name: "escape" });
}

export function toOutputString(output: TestWritable): string {
  return output.writes
    .map((entry) => (typeof entry === "string" ? entry : entry.toString("utf8")))
    .join("");
}
