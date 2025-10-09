import { describe, expect, it } from "bun:test";
import { Readable, Writable } from "node:stream";
import type { Key } from "node:readline";
import { EnvStringPrompt } from "../EnvStringPrompt";
import type { EnvPromptOptions } from "../EnvPrompt";
import { PREVIOUS_SYMBOL, SKIP_SYMBOL } from "../../visuals/symbols";

class TestWritable extends Writable {
  public readonly writes: Array<string | Buffer> = [];

  override _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.writes.push(typeof chunk === "string" ? chunk : Buffer.from(chunk, encoding));
    callback();
  }
}

function createStreams() {
  const input = new Readable({ read() {} });
  const output = new TestWritable();
  return { input, output };
}

function createPrompt(
  options: Partial<EnvPromptOptions<string>> & { key?: string } = {}
) {
  const streams = createStreams();
  const prompt = new EnvStringPrompt({
    key: options.key ?? "TEST_ENV",
    description: options.description,
    current: options.current,
    default: options.default,
    required: options.required ?? false,
    maxDisplayLength: options.maxDisplayLength,
    secret: options.secret,
    mask: options.mask,
    theme: options.theme,
    secretToggleShortcut: options.secretToggleShortcut,
    previousEnabled: options.previousEnabled,
    validate: options.validate,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
  });

  return { prompt, ...streams };
}

const baseKey = (partial: Partial<Key>): Key =>
  ({
    name: undefined,
    ctrl: false,
    meta: false,
    shift: false,
    sequence: undefined,
    code: undefined,
    ...partial,
  } as Key);

describe("EnvStringPrompt", () => {
  it("uses the provided input and output streams", () => {
    const { input, output, prompt } = createPrompt({
      description: "Custom stream test",
    });

    const promptInput = Reflect.get(prompt, "input");
    const promptOutput = Reflect.get(prompt, "output");

    expect(promptInput).toBe(input);
    expect(promptOutput).toBe(output);
    expect(output.writes).toHaveLength(0);
  });

  it("defaults to typing mode when no current or default is provided", () => {
    const { prompt } = createPrompt({ required: true });

    expect(prompt.isTyping).toBe(true);
    expect(prompt.value).toBe("");

    (prompt as any)._setUserInput("hello");
    expect(prompt.userInput).toBe("hello");
    expect(prompt.value).toBe("hello");
  });

  it("navigates current and default selections with cursor events", () => {
    const { prompt } = createPrompt({ current: "current", default: "default" });

    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe("current");

    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe("default");

    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(2);
    expect(prompt.value).toBe("");

    prompt.emit("cursor", "up");
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe("default");
  });

  it("enters typing mode and tracks input when characters are pressed", () => {
    const { prompt } = createPrompt({ current: "current", default: "default" });

    prompt.emit("cursor", "down");
    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(2);
    expect(prompt.isTyping).toBe(false);

    prompt.emit("key", "a", baseKey({ name: "a" }));

    expect(prompt.isTyping).toBe(true);
    expect(prompt.cursor).toBe(2);
    expect(prompt.userInput).toBe("a");
    expect(prompt.value).toBe("a");

    (prompt as any)._setUserInput("abc");
    expect(prompt.userInput).toBe("abc");
    expect(prompt.value).toBe("abc");
  });

  it("exits typing mode with escape and resets the input", () => {
    const { prompt } = createPrompt({ current: "current", default: "default" });

    prompt.emit("cursor", "down");
    prompt.emit("cursor", "down");
    prompt.emit("key", "a", baseKey({ name: "a" }));
    expect(prompt.isTyping).toBe(true);

    prompt.emit("key", undefined, baseKey({ name: "escape" }));

    expect(prompt.isTyping).toBe(false);
    expect(prompt.userInput).toBe("");
    expect(prompt.value).toBe("");
  });

  it("toggles secret reveal with Ctrl+R", () => {
    const { prompt } = createPrompt({ secret: true });

    expect((prompt as any).isSecretRevealed()).toBe(false);

    prompt.emit("key", undefined, baseKey({ name: "r", ctrl: true }));
    expect((prompt as any).isSecretRevealed()).toBe(true);

    prompt.emit("key", undefined, baseKey({ name: "r", ctrl: true }));
    expect((prompt as any).isSecretRevealed()).toBe(false);
  });

  it("activates skip option from the footer toolbar", () => {
    const { prompt } = createPrompt({ current: "current" });

    expect((prompt as any).isOptionPickerOpen()).toBe(false);

    prompt.emit("key", undefined, baseKey({ name: "tab" }));
    expect((prompt as any).isOptionPickerOpen()).toBe(true);

    prompt.emit("key", undefined, baseKey({ name: "return" }));

    const skipValue = prompt.value as unknown;
    expect(skipValue).toBe(SKIP_SYMBOL);
    expect(prompt.state).toBe("submit");
    expect((prompt as any).isOptionPickerOpen()).toBe(false);
  });

  it("activates previous option when available", () => {
    const { prompt } = createPrompt({ current: "current", previousEnabled: true });

    prompt.emit("key", undefined, baseKey({ name: "tab" }));
    prompt.emit("key", undefined, baseKey({ name: "right" }));
    expect((prompt as any).isOptionPickerOpen()).toBe(true);

    prompt.emit("key", undefined, baseKey({ name: "return" }));

    const previousValue = prompt.value as unknown;
    expect(previousValue).toBe(PREVIOUS_SYMBOL);
    expect(prompt.state).toBe("submit");
  });
});
