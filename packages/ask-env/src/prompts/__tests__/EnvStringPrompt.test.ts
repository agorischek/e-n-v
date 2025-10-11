import { describe, expect, it } from "bun:test";
import { EnvStringPrompt } from "../EnvStringPrompt";
import type { EnvPromptOptions } from "../EnvPrompt";
import {
  TestWritable,
  createTestStreams,
  waitForIO,
  typeText,
  submitPrompt,
  cancelPrompt,
  toOutputString,
  pressKey,
  backspace,
} from "./helpers/promptTestUtils";

function createPrompt(
  options: Partial<EnvPromptOptions<string>> & { key?: string } = {}
) {
  const streams = createTestStreams();
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

const STRIP_ANSI = /[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const stripAnsi = (value: string) => value.replace(STRIP_ANSI, "");

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

  it("defaults to typing mode when no current or default is provided", async () => {
  const { prompt } = createPrompt({ required: true });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    expect(prompt.isTyping).toBe(true);
    expect(prompt.value).toBe("");

    await typeText(prompt as any, "hello");
    expect(prompt.userInput).toBe("hello");
    expect(prompt.value).toBe("hello");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("navigates current and default selections with arrow keys", async () => {
  const { prompt } = createPrompt({ current: "current", default: "default" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe("current");

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe("default");

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(2);
    expect(prompt.value).toBe("");

    await pressKey(prompt, { name: "up" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe("default");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("enters typing mode and tracks input when characters are pressed", async () => {
  const { prompt } = createPrompt({ current: "current", default: "default" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(2);
    expect(prompt.isTyping).toBe(false);

    await typeText(prompt as any, "abc");
    expect(prompt.isTyping).toBe(true);
    expect(prompt.cursor).toBe(2);
    expect(prompt.userInput).toBe("abc");
    expect(prompt.value).toBe("abc");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("exits typing mode with escape and resets the input", async () => {
  const { prompt } = createPrompt({ current: "current", default: "default" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt as any, "hi");
    expect(prompt.isTyping).toBe(true);

    await pressKey(prompt, { name: "escape" });

    expect(prompt.isTyping).toBe(false);
    expect(prompt.userInput).toBe("");
    expect(prompt.value).toBe("");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("toggles secret reveal with Ctrl+R", async () => {
  const { prompt } = createPrompt({ secret: true });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    expect((prompt as any).isSecretRevealed()).toBe(false);

    await pressKey(prompt, { name: "r", ctrl: true });
    expect((prompt as any).isSecretRevealed()).toBe(true);

    await pressKey(prompt, { name: "r", ctrl: true });
    expect((prompt as any).isSecretRevealed()).toBe(false);

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("renders submitted masked values using the prompt format", async () => {
  const { prompt, output } = createPrompt({ secret: true, mask: "#", maxDisplayLength: 4 });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await typeText(prompt as any, "super-secret-value");
    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("TEST_ENV");
    expect(rendered).toContain("=");
    expect(rendered).toContain("####...");
  });

  it("renders cancelled prompts using the cancel renderer", async () => {
  const { prompt, output } = createPrompt({ current: "value" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    cancelPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise.catch(() => undefined);

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("TEST_ENV");
    expect(rendered).toMatch(/✕/);
  });

  it("dimms inputs while the option picker is open", async () => {
  const { prompt, output } = createPrompt({ current: "same", default: "same" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    const openRender = stripAnsi(toOutputString(output));
    expect((prompt as any).isOptionPickerOpen()).toBe(true);
    expect(openRender).toContain("(current, default)");

    await pressKey(prompt, { name: "escape" });
    await waitForIO(2);
    expect((prompt as any).isOptionPickerOpen()).toBe(false);

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("prevents submitting empty custom entries when required", async () => {
  const { prompt } = createPrompt({ current: "curr", default: "def", required: true });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe((prompt as any).getTextInputIndex());

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("Value cannot be empty");
    expect(prompt.isTyping).toBe(true);

    await typeText(prompt as any, "valid");
    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("allows optional custom entries to remain empty", async () => {
  const { prompt } = createPrompt({ current: "curr", default: "def", required: false });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("Value cannot be empty");

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("submit");
    await promptPromise;
  });

  it("applies custom validation for selected values", async () => {
    const calls: Array<string | undefined> = [];
    const validate = (value?: string) => {
      calls.push(value);
      if (value === "def") return "blocked";
      return undefined;
    };

  const { prompt } = createPrompt({ current: "curr", default: "def", validate });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    expect(prompt.value).toBe("def");

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("blocked");
    expect(calls).toEqual(["def"]);

    await pressKey(prompt, { name: "up" });
    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("applies custom validation to typed input", async () => {
    const calls: Array<string | undefined> = [];
    const validate = (value?: string) => {
      calls.push(value);
      if (value === "warn") return "warn";
      if (value === "bad") return new Error("bad input");
      return undefined;
    };

  const { prompt } = createPrompt({ current: "curr", default: "def", validate });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });

    await typeText(prompt as any, "warn");
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("warn");
    expect(calls).toEqual(["warn"]);

    await backspace(prompt, prompt.userInput.length);
    await typeText(prompt as any, "bad");
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("bad input");
    expect(calls).toEqual(["warn", "bad"]);

    await backspace(prompt, prompt.userInput.length);
    await typeText(prompt as any, "good");
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);
    expect(prompt.state).toBe("submit");
    expect(calls).toEqual(["warn", "bad", "good"]);
    await promptPromise;
  });

  it("respects custom validateInput responses", async () => {
  const { prompt } = createPrompt({ current: "curr", default: "def" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    (prompt as any).validateInput = () => "format error";

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt as any, "input");

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("format error");

    (prompt as any).validateInput = () => undefined;
    await backspace(prompt, prompt.userInput.length);
    await typeText(prompt as any, "ok");

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("submit");
    await promptPromise;
  });

  it("updates values for text-only prompts including parse failures", async () => {
    const { prompt } = createPrompt();
    (prompt as any).parseInput = (input: string) => {
      if (input === "fail") {
        throw new Error("fail");
      }
      return input;
    };

    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await typeText(prompt as any, "text");
    expect(prompt.value).toBe("text");

  await backspace(prompt, prompt.userInput.length);
  await typeText(prompt as any, "fail");
  await waitForIO(2);
  expect(prompt.userInput).toBe("fail");

  await (prompt as any).updateValue();
  expect(prompt.value).toBe("");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("updates values when selecting between current, default, and other", async () => {
  const { prompt } = createPrompt({ current: "curr", default: "def" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    expect(prompt.value).toBe("curr");

    await pressKey(prompt, { name: "down" });
    expect(prompt.value).toBe("def");

    await pressKey(prompt, { name: "down" });
    expect(prompt.value).toBe("");

    await typeText(prompt as any, "typed");
    expect(prompt.value).toBe("typed");

    await pressKey(prompt, { name: "up" });
    expect(prompt.value).toBe("def");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });

  it("exposes helper utilities for masking and display", async () => {
  const { prompt } = createPrompt({ current: "curr", default: "def", secret: true, mask: "*" });
  const promptPromise = prompt.prompt();
  await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt as any, "secret");

    expect((prompt as any).getTextInputIndex()).toBe(2);
    expect((prompt as any).getEntryHint()).toBe("Enter a secret value");
    expect((prompt as any).getInputDisplay(false)).toBe("******");
    expect((prompt as any).formatValue("secret")).toBe("******");

    await pressKey(prompt, { name: "r", ctrl: true });
    expect((prompt as any).getInputDisplay(true)).toBe("secret█");

    submitPrompt(prompt as any);
    await waitForIO(2);
    await promptPromise;
  });
});
