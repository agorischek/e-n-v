import { describe, expect, it } from "bun:test";
import { EnvEnumPrompt } from "../typed/EnvEnumPrompt";
import { EnumEnvVarSchema } from "@envcredible/core";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import { createTestStreams, baseKey } from "./helpers/promptTestUtils";

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

    expect((prompt as any).isOptionPickerOpen()).toBe(false);
    const initialCursor = prompt.cursor;

    prompt.emit("key", undefined, baseKey({ name: "tab" }));
    expect((prompt as any).isOptionPickerOpen()).toBe(true);

    prompt.emit("cursor", "down");
    expect(prompt.cursor).toBe(initialCursor);

    prompt.emit("key", undefined, baseKey({ name: "tab" }));
    expect((prompt as any).isOptionPickerOpen()).toBe(false);
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


});
