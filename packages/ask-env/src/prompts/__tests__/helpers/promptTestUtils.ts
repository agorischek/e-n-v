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
