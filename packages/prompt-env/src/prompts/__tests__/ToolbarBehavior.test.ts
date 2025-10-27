import { describe, it, expect } from "bun:test";
import { NumberEnvVarSchema } from "@envcredible/core";
import { EnvNumberPrompt } from "../typed/EnvNumberPrompt";
import { waitForIO, pressKey } from "./helpers/promptTestUtils";

function normalizeCurrent(value?: number): string | undefined {
  return value === undefined ? undefined : value.toString();
}

function createPrompt(
  options: {
    current?: number;
    default?: number;
    secret?: boolean;
  } = {},
) {
  const output: string[] = [];
  const mockOutput = {
    write: (chunk: string) => output.push(chunk),
    on: () => {},
    off: () => {},
  } as any;

  const schema = new NumberEnvVarSchema({
    default: options.default,
  });

  const prompt = new EnvNumberPrompt(schema, {
    key: "TEST_NUM",
    current: normalizeCurrent(options.current),
    secret: options.secret,
    output: mockOutput,
  });

  return { prompt, output };
}

describe("EnvPrompt Toolbar Behavior", () => {
  it("does not submit when pressing Enter on toolbar options", async () => {
    const { prompt } = createPrompt({ secret: true });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Open toolbar with Tab
    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);
    // Navigate to the Show/Hide option (skip is first, previous maybe second)
    await pressKey(prompt, { name: "right" });
    await waitForIO(1);

    // Press Enter on the Show/Hide option (should not submit)
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    // Prompt should still be active, not submitted
    expect(prompt.state).toBe("active");

    // Close toolbar and submit normally
    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);

    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    // Now it should submit
    expect(prompt.state).toBe("submit");
    await promptPromise;
  });

  it("toggles secret visibility without submitting", async () => {
    const { prompt } = createPrompt({ secret: true, current: 42 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Open toolbar
    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);

    // Navigate to the secret toggle option (assuming it's available)
    // and press enter to toggle
    await pressKey(prompt, { name: "right" }); // Navigate to Show/Hide option
    await pressKey(prompt, { name: "return" }); // Toggle secret visibility
    await waitForIO(2);

    // Should still be active (not submitted)
    expect(prompt.state).toBe("active");

    // Submit normally
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);
    expect(prompt.state).toBe("submit");
    await promptPromise;
  });

  it("allows skip option to submit with skip outcome", async () => {
    const { prompt } = createPrompt({ current: 42 });
    const promptPromise = prompt.prompt();
    await waitForIO(2);

    // Open toolbar
    await pressKey(prompt, { name: "tab" });
    await waitForIO(2);

    // Press enter on skip (first option)
    await pressKey(prompt, { name: "return" });
    await waitForIO(2);

    // Should submit with skip outcome
    expect(prompt.state).toBe("submit");
    expect(prompt.getOutcome()).toBe("skip");
    await promptPromise;
  });
});
