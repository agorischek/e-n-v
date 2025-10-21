import { describe, expect, it } from "bun:test";
import { EnvBooleanPrompt } from "../EnvBooleanPrompt";
import type { EnvPromptOptions } from "../EnvPrompt";
import type { BooleanEnvVarSchema } from "@envcredible/types";
import {
  createTestStreams,
  waitForIO,
  pressKey,
  submitPrompt,
  cancelPrompt,
  toOutputString,
} from "./helpers/promptTestUtils";

type TestPromptOptions = Partial<EnvPromptOptions<boolean>> & {
  key?: string;
  description?: string;
  required?: boolean;
  validate?: BooleanEnvVarSchema["validate"];
};

function createPrompt(options: TestPromptOptions = {}) {
  const streams = createTestStreams();
  const schema: BooleanEnvVarSchema = {
    type: "boolean",
    required: options.required ?? false,
    description: options.description,
    default: options.default,
    validate: options.validate,
  };

  const prompt = new EnvBooleanPrompt(schema, {
    key: options.key ?? "BOOL_ENV",
    current: options.current,
    theme: options.theme,
    previousEnabled: options.previousEnabled,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
    maxDisplayLength: options.maxDisplayLength,
    secret: options.secret,
    mask: options.mask,
    secretToggleShortcut: options.secretToggleShortcut,
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

describe("EnvBooleanPrompt", () => {
  it("initializes cursor from current before default and wraps with arrows", async () => {
    const { prompt } = createPrompt({ current: false, default: true });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe(false);

    await pressKey(prompt, { name: "up" });
    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(true);

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe(false);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("renders annotations for current and default values", async () => {
    const { prompt, output } = createPrompt({
      current: true,
      default: true,
      description: "Choose wisely",
    });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("(current, default)");
    expect(rendered).toContain("Choose wisely");

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("applies custom validation, handles navigation, and eventually succeeds", async () => {
    const calls: Array<boolean | undefined> = [];
    let allowTrue = false;
    const validate = (value?: boolean) => {
      calls.push(value);
      if (value === false) {
        return "false not allowed";
      }
      if (value === true && !allowTrue) {
        allowTrue = true;
        return new Error("true not allowed once");
      }
      return undefined;
    };

    const { prompt } = createPrompt({ current: false, validate });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("false not allowed");
    expect(calls).toEqual([false]);

    await pressKey(prompt, { name: "up" });
    await waitForIO(2);
    expect(prompt.state).toBe("active");
    expect(prompt.cursor).toBe(0);

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("error");
    expect(prompt.error).toBe("true not allowed once");
    expect(calls).toEqual([false, true]);

    submitPrompt(prompt);
    await waitForIO(2);
    expect(prompt.state).toBe("submit");
    expect(calls).toEqual([false, true, true]);
    await promptPromise;
  });

  it("renders cancelled prompts", async () => {
    const { prompt, output } = createPrompt({ current: true });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    cancelPrompt(prompt);
    await waitForIO(2);
    await promptPromise.catch(() => undefined);

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("BOOL_ENV");
    expect(rendered).toMatch(/✕/);
  });

  it("dims options while the footer picker is open", async () => {
    const { prompt, output } = createPrompt();
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);

    expect((prompt as any).isOptionPickerOpen()).toBe(true);
    const dimOutput = stripAnsi(toOutputString(output));
    expect(dimOutput).toContain("Skip");

    await pressKey(prompt, { name: "escape" });
    await waitForIO(2);
    expect((prompt as any).isOptionPickerOpen()).toBe(false);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("renders submitted values in ENV_KEY=value format", async () => {
    const { prompt, output } = createPrompt({ current: true });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("BOOL_ENV");
    expect(rendered).toContain("=true");
  });
});
