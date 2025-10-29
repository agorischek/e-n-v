import { describe, expect, it } from "bun:test";
import { EnvEnumPrompt } from "../typed/EnvEnumPrompt";
import { EnumEnvVarSchema } from "@e-n-v/core";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import {
  createTestStreams,
  baseKey,
  pressKey,
  waitForIO,
  toOutputString,
  cancelPrompt,
} from "./helpers/promptTestUtils";

type TestPromptOptions = Partial<EnvPromptOptions<string>> & {
  key?: string;
  options?: string[];
  required?: boolean;
  description?: string;
  default?: string;
};

function createPrompt(options: TestPromptOptions = {}) {
  const streams = createTestStreams();
  const values = options.options ?? ["alpha", "beta", "gamma"];

  const schema = new EnumEnvVarSchema({
    required: options.required ?? false,
    default: options.default,
    description: options.description,
    values: values,
  });

  const prompt = new EnvEnumPrompt(schema, {
    key: options.key ?? "TEST_ENV",
    current: options.current,
    theme: options.theme,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
    truncate: options.truncate,
    secret: options.secret,
    index: options.index,
    total: options.total,
  });

  return { prompt, ...streams };
}

// eslint-disable-next-line no-control-regex
const STRIP_ANSI = /\x1b\[[0-?]*[ -/]*[@-~]/g;
const stripAnsi = (value: string) => value.replace(STRIP_ANSI, "");

describe("EnvEnumPrompt", () => {
  it("initializes value from current before default and options", () => {
    const { prompt } = createPrompt({
      current: "beta",
      default: "gamma",
      options: ["alpha", "beta", "gamma"],
    });

    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe("beta");

    const fallback = createPrompt({
      default: "gamma",
      options: ["alpha", "beta", "gamma"],
    }).prompt;

    expect(fallback.cursor).toBe(2);
    expect(fallback.value).toBe("gamma");

    const firstOption = createPrompt({ options: ["alpha", "beta"] }).prompt;
    expect(firstOption.cursor).toBe(0);
    expect(firstOption.value).toBe("alpha");
  });

  it("wraps cursor navigation through the available options", () => {
    const { prompt } = createPrompt({
      options: ["one", "two", "three"],
      current: "one",
    });

    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe("one");

    prompt.emit("cursor", "up");
    expect(prompt.cursor).toBe(2);
    expect(prompt.value).toBe("three");

    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe("one");

    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe("two");
  });

  it("ignores cursor events while the toolbar option picker is open", () => {
    const { prompt } = createPrompt();

    expect((prompt as any).mode.isToolbarOpen()).toBe(false);
    const initialCursor = prompt.cursor;

    prompt.emit("key", undefined, baseKey({ name: "tab" }));
    expect((prompt as any).mode.isToolbarOpen()).toBe(true);

    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(initialCursor);

    prompt.emit("key", undefined, baseKey({ name: "tab" }));
    expect((prompt as any).mode.isToolbarOpen()).toBe(false);
  });

  it("renders submitted values in ENV_KEY=value format", () => {
    const { prompt } = createPrompt();

    prompt.value = "beta";
    prompt.state = "submit";
    const render = Reflect.get(prompt as any, "_render") as () =>
      | string
      | undefined;
    const output = render();

    expect(typeof output).toBe("string");
    expect(output).toContain("TEST_ENV");
    expect(output).toContain("beta");
    expect(output).toContain("=");
  });

  it("renders an invalid current value as a selectable option without initial focus", async () => {
    const { prompt, output } = createPrompt({
      current: "staging",
      default: "production",
      options: ["development", "production"],
    });

    const promptPromise = prompt.prompt();
    await waitForIO(2);

    expect(prompt.cursor).toBe(2);
    expect(prompt.value).toBe("production");

    const initialRender = toOutputString(output);
    const strippedInitial = stripAnsi(initialRender);
    expect(strippedInitial).toContain("○ staging");

    await pressKey(prompt, { name: "up" });
    await pressKey(prompt, { name: "up" });
    await waitForIO(1);

    expect(prompt.cursor).toBe(0);

    const selectedRender = toOutputString(output);
    const stripped = stripAnsi(selectedRender);
    expect(stripped).toContain("● staging");
    expect(stripped).toContain("(current, invalid)");

    cancelPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });
});
