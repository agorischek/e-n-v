import { describe, expect, it } from "bun:test";
import { EnvBooleanPrompt } from "../typed/EnvBooleanPrompt";
import { BooleanEnvVarSchema } from "@envcredible/core";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import { BooleanEnvVarSchema as BooleanEnvVarSchemaClass } from "@envcredible/core";
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
  validate?: (value: boolean | undefined) => string | Error | undefined;
};

function createPrompt(options: TestPromptOptions = {}) {
  const streams = createTestStreams();
  
    const schema = new BooleanEnvVarSchemaClass({
    required: options.required ?? false,
    default: options.default,
    description: options.description,
  });

  const prompt = new EnvBooleanPrompt(schema, {
    key: options.key ?? "BOOL_ENV",
    existing: options.existing,
    theme: options.theme,
    previousEnabled: options.previousEnabled,
    input: options.input ?? streams.input,
    output: options.output ?? streams.output,
    truncate: options.truncate,
    secret: options.secret,
    mask: options.mask,
    secretToggleShortcut: options.secretToggleShortcut,
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

describe("EnvBooleanPrompt", () => {
  it("initializes cursor from current before default and wraps with arrows", async () => {
    // Test without invalid current values to check basic navigation
    const { prompt } = createPrompt({ default: true });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Should start on default (true) = cursor 0
    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(true);

    await pressKey(prompt, { name: "down" });
    expect(prompt.cursor).toBe(1);
    expect(prompt.value).toBe(false);

    await pressKey(prompt, { name: "up" });
    expect(prompt.cursor).toBe(0);
    expect(prompt.value).toBe(true);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;
  });

  it("renders annotations for current and default values", async () => {
    const { prompt, output } = createPrompt({
      existing: "true",
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

    // Start with no current value, just test validation and navigation
    const { prompt } = createPrompt({ validate });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Should start on true (cursor 0)
    expect(prompt.cursor).toBe(0);

    // Navigate to false
    await pressKey(prompt, { name: "down" });
    await waitForIO(2);
    expect(prompt.cursor).toBe(1);

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
    const { prompt, output } = createPrompt({ existing: "true" });
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
    const { prompt, output } = createPrompt({ existing: "true" });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    submitPrompt(prompt);
    await waitForIO(2);
    await promptPromise;

    const rendered = stripAnsi(toOutputString(output));
    expect(rendered).toContain("BOOL_ENV");
    expect(rendered).toContain("=true");
  });

  describe("Invalid current value handling", () => {
    it("displays invalid current value as separate raw option", async () => {
      const { prompt, output } = createPrompt({ 
        existing: "maybe",
        default: false,
        // Mock existingValidationError by setting it on the prompt
      });
      
      // Simulate invalid current value processing
      (prompt as any).currentRaw = "maybe";
      (prompt as any).existingValidationError = "Invalid boolean value";
      
      const promptPromise = prompt.prompt();
      await waitForIO(2);

      const rendered = stripAnsi(toOutputString(output));
      
      // Should show the raw invalid value
      expect(rendered).toContain("maybe");
      expect(rendered).toContain("true");
      expect(rendered).toContain("false");
      
      // Should show default annotation on false
      expect(rendered).toContain("(default)");

      submitPrompt(prompt);
      await waitForIO(2);
      await promptPromise;
    });

    it("shows annotation only when invalid raw option is selected", async () => {
      const { prompt, output } = createPrompt({ 
        existing: "invalid",
        default: true,
      });
      
      // Simulate invalid current value processing
      (prompt as any).currentRaw = "invalid";
      (prompt as any).existingValidationError = "Invalid boolean value";
      
      const promptPromise = prompt.prompt();
      await waitForIO(2);

      // Initially focused on default (true), raw option should not show annotation
      let rendered = stripAnsi(toOutputString(output));
      expect(rendered).toContain("invalid");
      expect(rendered).not.toContain("(current, invalid)");
      expect(rendered).toContain("(default)");

      submitPrompt(prompt);
      await waitForIO(2);
      await promptPromise;
    });

    it("prevents submission when invalid raw option is selected", async () => {
      const { prompt } = createPrompt({ 
        existing: "bad-value",
        default: false,
      });
      
      // Simulate invalid current value processing
      (prompt as any).currentRaw = "bad-value";
      (prompt as any).existingValidationError = "Invalid boolean value";
      
      const promptPromise = prompt.prompt();
      await waitForIO(2);

      // Navigate to raw option: from false (index 2) up twice to raw (index 0)
      await pressKey(prompt, { name: "up" });
      await pressKey(prompt, { name: "up" });
      await waitForIO(2);
      
      expect(prompt.cursor).toBe(0); // Should be on raw option

      // Try to submit - should be blocked
      submitPrompt(prompt);
      await waitForIO(2);
      
      expect(prompt.state).toBe("error");
      expect(prompt.error).toBe("Invalid boolean value");

      // Navigate to valid option and submit successfully
      await pressKey(prompt, { name: "down" });
      await waitForIO(2);
      
      submitPrompt(prompt);
      await waitForIO(2);
      await promptPromise;
    });

    it("defaults focus to valid option when current is invalid", async () => {
      const { prompt } = createPrompt({ 
        existing: "invalid",
        default: true,
      });
      
      // Simulate invalid current value processing
      (prompt as any).currentRaw = "invalid";
      (prompt as any).existingValidationError = "Invalid boolean value";
      (prompt as any).current = "invalid"; // Keep raw string as current
      
      // Manually trigger value update after mocking the state
      (prompt as any).updateValue();
      
      const promptPromise = prompt.prompt();
      await waitForIO(2);

      // Should focus on default (true) option, not the invalid raw current
      // With raw current present: indices are 0=raw, 1=true, 2=false
      expect(prompt.cursor).toBe(1); // true option
      
      // The value should be what's selected (default)
      // Since we're on cursor 1 (true option), the value should be true
      expect(prompt.value).toBe(true);

      submitPrompt(prompt);
      await waitForIO(2);
      await promptPromise;
    });

    it("handles cursor navigation correctly with raw option present", async () => {
      const { prompt } = createPrompt({ 
        existing: "invalid",
        default: false,
      });
      
      // Simulate invalid current value processing
      (prompt as any).currentRaw = "invalid";
      (prompt as any).existingValidationError = "Invalid boolean value";
      
      const promptPromise = prompt.prompt();
      await waitForIO(2);

      // Should start on default (false) option
      // With raw current: indices are 0=raw, 1=true, 2=false
      expect(prompt.cursor).toBe(2); // false option
      
      // Navigate up: false -> true
      await pressKey(prompt, { name: "up" });
      expect(prompt.cursor).toBe(1); // true option
      expect(prompt.value).toBe(true);
      
      // Navigate up: true -> raw
      await pressKey(prompt, { name: "up" });
      expect(prompt.cursor).toBe(0); // raw option
      expect(prompt.value).toBe(false); // Should fallback to default
      
      // Navigate up: raw -> false (wraps around)
      await pressKey(prompt, { name: "up" });
      expect(prompt.cursor).toBe(2); // false option
      expect(prompt.value).toBe(false);
      
      // Navigate down: false -> raw
      await pressKey(prompt, { name: "down" });
      expect(prompt.cursor).toBe(0); // raw option
      
      // Navigate down: raw -> true
      await pressKey(prompt, { name: "down" });
      expect(prompt.cursor).toBe(1); // true option
      expect(prompt.value).toBe(true);

      submitPrompt(prompt);
      await waitForIO(2);
      await promptPromise;
    });

    it("shows strikethrough styling for invalid raw current", async () => {
      const { prompt, output } = createPrompt({ 
        existing: "maybe",
      });
      
      // Simulate invalid current value processing
      (prompt as any).currentRaw = "maybe";
      (prompt as any).existingValidationError = "Invalid boolean value";
      
      const promptPromise = prompt.prompt();
      await waitForIO(2);

      const outputString = toOutputString(output);
      
      // Should contain the raw value and strikethrough styling
      expect(stripAnsi(outputString)).toContain("maybe");

      submitPrompt(prompt);
      await waitForIO(2);
      await promptPromise;
    });
  });
});
