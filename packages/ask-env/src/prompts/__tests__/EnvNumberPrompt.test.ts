import { describe, expect, it } from "bun:test";
import { EnvNumberPrompt } from "../typed/EnvNumberPrompt";
import { NumberEnvVarSchema } from "@envcredible/core";
import type { EnvPromptOptions } from "../options";
import { NumberEnvVarSchema as NumberEnvVarSchemaClass } from "@envcredible/core";
import {
  createTestStreams,
  waitForIO,
  pressKey,
  typeText,
  backspace,
  submitPrompt,
  cancelPrompt,
  toOutputString,
} from "./helpers/promptTestUtils";

function createPrompt(
  options: Partial<EnvPromptOptions<number>> & {
    key?: string;
    description?: string;
    required?: boolean;
    validate?: (value: number | undefined) => string | Error | undefined;
  } = {},
) {
  const streams = createTestStreams();
  
  const schema = new NumberEnvVarSchemaClass({
    required: options.required ?? false,
    default: options.default,
    description: options.description,
  });

  const prompt = new EnvNumberPrompt(schema, {
    key: options.key ?? "NUM_ENV",
    current: options.current,
    maxDisplayLength: options.maxDisplayLength,
    theme: options.theme,
    previousEnabled: options.previousEnabled,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
    validate: options.validate,
  });

  return { prompt, ...streams };
}

const ESC = String.fromCharCode(0x1b);
const CSI = String.fromCharCode(0x9b);
const STRIP_ANSI = new RegExp(
  `[${ESC}${CSI}][[\\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]`,
  "g",
);
const stripAnsi = (value: string) => value.replace(STRIP_ANSI, "");

describe("EnvNumberPrompt", () => {
  it("defaults to typing mode when no current or default is provided", async () => {
    const { prompt, output } = createPrompt();
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    expect(prompt.isTyping).toBe(true);
    expect(prompt.value).toBe(0);

    await typeText(prompt, "42");
    expect(prompt.userInput).toBe("42");
    expect(prompt.value).toBe(42);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("NUM_ENV");
    expect(rendered).toContain("=42");
  });

  it("navigates current, default, and custom options", async () => {
    const { prompt } = createPrompt({ current: "1", default: 2 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(1);

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe(2);

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(2);
    expect(prompt.value).toBe(0);

    await typeText(prompt, "3");
    expect(prompt.userInput).toBe("3");
    expect(prompt.value).toBe(3);

    await pressKey(prompt, { name: "up" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe(2);

    await pressKey(prompt, { name: "up" });
    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(1);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("navigates to the custom option when only the schema default exists", async () => {
    const { prompt } = createPrompt({ default: 7 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(7);

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.isTyping).toBe(false);
    expect(prompt.value).toBe(0);

    await pressKey(prompt, { name: "up" });
    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(7);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("starts typing when printable characters are entered on a selection", async () => {
    const { prompt } = createPrompt({ current: "5", default: 6 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await typeText(prompt, "9");
    expect(prompt.cursor).toBe(2);
    expect(prompt.isTyping).toBe(true);
    expect(prompt.userInput).toBe("9");
    expect(prompt.value).toBe(9);

    await typeText(prompt, "8");
    expect(prompt.userInput).toBe("98");
    expect(prompt.value).toBe(98);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("prevents submitting empty or invalid numeric entries", async () => {
    const { prompt } = createPrompt({ current: "1", default: 2 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(2);

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("Please enter a number");
    expect(prompt.isTyping).toBe(true);

    await typeText(prompt, "abc");
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("Please enter a valid number");

    await backspace(prompt, prompt.userInput.length);
    await typeText(prompt, "5");
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("submit");
    expect(prompt.value).toBe(5);
    await promptPromise;
  });

  it("applies custom validation for selected and typed values", async () => {
    const calls: Array<number | undefined> = [];
    const validate = (value?: number) => {
      calls.push(value);
      if (value === 1) return "one blocked";
      if (value === 2) return new Error("two blocked");
      if (value === 7) return "seven blocked";
      return undefined;
    };

    const { prompt } = createPrompt({ current: "1", default: 2, validate });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("one blocked");
    expect(calls).toEqual([1]);

    await pressKey(prompt, { name: "down" });
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("two blocked");
    expect(calls).toEqual([1, 2]);

    await pressKey(prompt, { name: "down" });
    await typeText(prompt, "7");
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("seven blocked");
    expect(calls).toEqual([1, 2, 7]);

    await backspace(prompt, prompt.userInput.length);
    await typeText(prompt, "3");
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("submit");
    expect(prompt.value).toBe(3);
    expect(calls).toEqual([1, 2, 7, 3]);
    await promptPromise;
  });

  it("exits typing mode with escape and resets the input", async () => {
    const { prompt } = createPrompt({ current: "4", default: 5 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt, "99");
    expect(prompt.isTyping).toBe(true);

    await pressKey(prompt, { name: "escape" });
    await waitForIO(2);
    expect(prompt.isTyping).toBe(false);
    expect(prompt.userInput).toBe("");
    expect(prompt.value).toBe(0);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("renders cancelled prompts", async () => {
    const { prompt, output } = createPrompt({ current: "8" });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    cancelPrompt(prompt);
    await waitForIO(2);
    await promptPromise.catch(() => undefined);

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("NUM_ENV");
    expect(rendered).toMatch(/✕/);
  });

  it("dims options while the footer picker is open", async () => {
    const { prompt, output } = createPrompt({ current: "3", default: 4 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    expect((prompt as any).isOptionPickerOpen()).toBe(true);

    const dimmed = stripAnsi(toOutputString(output));
    expect(dimmed).toContain("Skip");

    await pressKey(prompt, { name: "escape" });
    await waitForIO(2);
    expect((prompt as any).isOptionPickerOpen()).toBe(false);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });
});
