import { describe, expect, it } from "bun:test";
import { EnvNumberPrompt } from "../typed/EnvNumberPrompt";
import { NumberEnvVarSchema } from "@e-n-v/core";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
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

type NumberPromptTestOptions = Partial<
  Omit<EnvPromptOptions<number>, "current">
> & {
  current?: number | string;
  key?: string;
  description?: string;
  required?: boolean;
  default?: number;
};

const normalizeCurrent = (value?: number | string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === "number" ? value.toString() : value;
};

function createPrompt(options: NumberPromptTestOptions = {}) {
  const streams = createTestStreams();

  const schema = new NumberEnvVarSchema({
    required: options.required ?? false,
    default: options.default,
    description: options.description,
  });

  const prompt = new EnvNumberPrompt(schema, {
    key: options.key ?? "NUM_ENV",
    current: normalizeCurrent(options.current),
    truncate: options.truncate,
    secret: options.secret,
    theme: options.theme,
    index: options.index,
    total: options.total,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
  });

  return { prompt, ...streams };
}

function createPromptWithSchema(
  schema: NumberEnvVarSchema,
  options: NumberPromptTestOptions = {},
) {
  const streams = createTestStreams();

  const prompt = new EnvNumberPrompt(schema, {
    key: options.key ?? "NUM_ENV",
    current: normalizeCurrent(options.current),
    secret: options.secret,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
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

    // Should be in typing mode - check that input is accepted immediately
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

  it("navigates between current, default, and custom options", async () => {
    const { prompt } = createPrompt({ current: 1, default: 2 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Start with current value
    expect(prompt.value).toBe(1);

    // Navigate to default
    await pressKey(prompt, { name: "down" });
    expect(prompt.value).toBe(2);

    // Navigate to custom option (should reset to 0)
    await pressKey(prompt, { name: "down" });
    expect(prompt.value).toBe(0);

    // Type a custom value
    await typeText(prompt, "3");
    expect(prompt.userInput).toBe("3");
    expect(prompt.value).toBe(3);

    // Navigate back to default
    await pressKey(prompt, { name: "up" });
    expect(prompt.value).toBe(2);

    // Navigate back to current
    await pressKey(prompt, { name: "up" });
    expect(prompt.value).toBe(1);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("labels distinct current and default numeric options", async () => {
    const { prompt, output } = createPrompt({ current: 5, default: 10 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await waitForIO(2);

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("(current)");
    expect(rendered).toContain("(default)");

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("navigates to custom option when only schema default exists", async () => {
    const { prompt } = createPrompt({ default: 7 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Start with default value
    expect(prompt.value).toBe(7);

    // Navigate to custom option
    await pressKey(prompt, { name: "down" });
    expect(prompt.value).toBe(0); // Reset to default number value

    // Navigate back to default
    await pressKey(prompt, { name: "up" });
    expect(prompt.value).toBe(7);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("starts typing when printable characters are entered", async () => {
    const { prompt } = createPrompt({ current: 5, default: 6 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Type a character - should jump to custom option and start typing
    await typeText(prompt, "9");
    expect(prompt.userInput).toBe("9");
    expect(prompt.value).toBe(9);

    // Continue typing
    await typeText(prompt, "8");
    expect(prompt.userInput).toBe("98");
    expect(prompt.value).toBe(98);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("prevents submitting empty or invalid numeric entries", async () => {
    const { prompt } = createPrompt({ current: 1, default: 2 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Navigate to custom option
    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });

    // Try to submit without entering anything - should show error
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("Please enter a number");

    // Try to submit invalid text - should show error
    await typeText(prompt, "abc");
    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("Please enter a valid number");

    // Enter valid number - should succeed
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

    // Create a schema with custom validation logic
    const schema = new NumberEnvVarSchema({
      default: 2,
      process: (value: unknown) => {
        if (typeof value === "number") return value;
        const numValue = parseInt(String(value), 10);
        calls.push(numValue);

        if (numValue === 1) {
          throw new Error("one blocked");
        }
        if (numValue === 2) {
          throw new Error("two blocked");
        }
        if (numValue === 7) {
          throw new Error("seven blocked");
        }
        return numValue;
      },
    });

    const { prompt } = createPromptWithSchema(schema, { current: 1 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "up" });
    expect((prompt as any).mode.getCursor()).toBe(0);

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

  it("marks invalid current numbers and prevents submission", async () => {
    const schema = new NumberEnvVarSchema({
      required: false,
      process: (value: unknown) => {
        if (typeof value === "number") return value;
        const str = String(value);
        if (str === "not-a-number") {
          throw new Error("invalid number");
        }
        return Number(str);
      },
    });

    const { prompt, output } = createPromptWithSchema(schema, {
      current: "not-a-number",
    });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    const initialRender = toOutputString(output);
    expect(initialRender).toContain("\u001b[9m");
    const initialStripped = stripAnsi(initialRender);
    expect(initialStripped).not.toContain("(current, invalid)");

    expect((prompt as any).mode.getCursor()).toBe(
      (prompt as any).getTextInputIndex(),
    );

    await pressKey(prompt, { name: "up" });
    await waitForIO(2);
    expect((prompt as any).mode.getCursor()).toBe(0);

    const focusedStripped = stripAnsi(toOutputString(output));
    expect(focusedStripped).toContain("(current, invalid)");

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("invalid number");

    await pressKey(prompt, { name: "down" });
    await waitForIO(2);
    await typeText(prompt as any, "42");
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.state).toBe("submit");
    expect(prompt.value).toBe(42);
    await promptPromise;
  });

  it("clears validation errors after moving focus away from an invalid current", async () => {
    const schema = new NumberEnvVarSchema({
      required: false,
      default: 5,
      process: (value: unknown) => {
        if (typeof value === "number") return value;
        const str = String(value);
        if (str === "bad") {
          throw new Error("invalid current");
        }
        return Number(str);
      },
    });

    const { prompt } = createPromptWithSchema(schema, {
      current: "bad",
    });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "up" });
    expect((prompt as any).mode.getCursor()).toBe(0);

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("invalid current");

    await pressKey(prompt, { name: "down" });
    await waitForIO(2);

    expect((prompt as any).mode.getCursor()).toBe(1);
    expect(prompt.state).toBe("active");
    expect(prompt.error).toBe("");

    cancelPrompt(prompt);
    await waitForIO(2);
    await promptPromise.catch(() => undefined);
  });

  it("exits typing mode with escape and resets the input", async () => {
    const { prompt } = createPrompt({ current: 5, default: 6 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Navigate to custom option and start typing
    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt, "99");
    expect(prompt.userInput).toBe("99");

    // Press escape to exit typing mode
    await pressKey(prompt, { name: "escape" });
    await waitForIO(2);
    expect(prompt.userInput).toBe("");
    expect(prompt.value).toBe(0); // Should reset to default value

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("renders cancelled prompts", async () => {
    const { prompt, output } = createPrompt({ current: 8 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    cancelPrompt(prompt);
    await waitForIO(2);
    await promptPromise.catch(() => undefined);

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("NUM_ENV");
    expect(rendered).toMatch(/✕/);
  });

  it("dims options while the toolbar picker is open", async () => {
    const { prompt, output } = createPrompt({ current: 3, default: 4 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    expect((prompt as any).mode.isToolbarOpen()).toBe(true);

    const dimmed = stripAnsi(toOutputString(output));
    expect(dimmed).toContain("Skip");

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    expect((prompt as any).mode.isToolbarOpen()).toBe(false);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("preserves numeric custom input when toggling secret via the toolbar", async () => {
    const { prompt } = createPrompt({
      current: 11,
      default: 22,
      secret: true,
    });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt, "12");
    expect(prompt.userInput).toBe("12");
    expect(prompt.value).toBe(12);

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    await pressKey(prompt, { name: "right" });
    await waitForIO(2);
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.userInput).toBe("12");
    expect(prompt.value).toBe(12);

    await typeText(prompt, "3");
    expect(prompt.userInput).toBe("123");
    expect(prompt.value).toBe(123);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("appends multiple digits after toggling secret", async () => {
    const { prompt } = createPrompt({
      current: 11,
      default: 22,
      secret: true,
    });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "down" });
    await pressKey(prompt, { name: "down" });
    await typeText(prompt, "45");
    expect(prompt.userInput).toBe("45");
    expect(prompt.value).toBe(45);

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    await pressKey(prompt, { name: "right" });
    await waitForIO(2);
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    expect(prompt.userInput).toBe("45");

    await typeText(prompt, "67");
    expect(prompt.userInput).toBe("4567");
    expect(prompt.value).toBe(4567);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });
});
