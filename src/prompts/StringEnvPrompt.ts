import { Prompt } from "@clack/core";
import type { Key } from "node:readline";
import color from "picocolors";
import { EnvPromptOptions } from "../EnvPromptOptions";

type Action = "up" | "down" | "left" | "right" | "space" | "enter" | "cancel";

interface StringEnvPromptOptions extends EnvPromptOptions<string> {}

export class StringEnvPrompt extends Prompt<string> {
  cursor = 0;
  isTyping = false;
  private options: StringEnvPromptOptions;

  constructor(opts: StringEnvPromptOptions) {
    super(
      {
        ...opts,
        render: function (this: StringEnvPrompt) {
          const options = [opts.current, opts.default, "Enter value..."];

          if (this.state === "submit") {
            return `Selected: ${this.value}`;
          }

          let output = "";

          options.forEach((label, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected ? color.green("●") : color.dim("○");

            if (index === 2) {
              // Third option - special handling for text input
              if (this.isTyping) {
                const displayText = `${this.userInput}█`;
                output += `  ${circle} ${color.white(displayText)}\n`;
              } else if (isSelected) {
                // Show cursor immediately when selected, even before typing
                output += `  ${circle} ${color.white("█")}\n`;
              } else {
                // "Enter value..." is gray when not selected
                output += `  ${circle} ${color.gray(label)}\n`;
              }
            } else {
              // Current and Default options - white when selected, gray when not
              const text = isSelected ? color.white(label) : color.gray(label);
              const suffix = index === 0 ? color.gray(" (current)") : color.gray(" (default)");
              output += `  ${circle} ${text}${suffix}\n`;
            }
          });

          return output;
        },
        validate: (value) => {
          // If we're on the custom entry option but not typing yet, prevent submission
          if (this.cursor === 2 && !this.isTyping) {
            // Start typing mode instead of submitting
            this.isTyping = true;
            (this as any)._track = true;
            this._setUserInput("");
            this.updateValue();
            return "Starting input mode"; // This will cause validation to fail and stay active
          }

          // If we're typing on the custom option but haven't entered anything, prevent submission
          if (
            this.cursor === 2 &&
            this.isTyping &&
            (!this.userInput || !this.userInput.trim())
          ) {
            return "Please enter a value or press Escape to cancel";
          }

          // All other cases are valid
          return undefined;
        },
      },
      false
    );

    this.options = opts;

    // Set initial value to current
    this.value = this.options.current;

    this.on("cursor", (action?: Action) => {
      switch (action) {
        case "up":
          // If we're typing or on the text option, clear input and exit typing mode
          if (this.isTyping || this.cursor === 2) {
            this.isTyping = false;
            (this as any)._track = false;
            this._clearUserInput(); // This clears the internal readline state too
          }
          this.cursor = this.cursor === 0 ? 2 : this.cursor - 1;
          break;
        case "down":
          // If we're typing or on the text option, clear input and exit typing mode
          if (this.isTyping || this.cursor === 2) {
            this.isTyping = false;
            (this as any)._track = false;
            this._clearUserInput(); // This clears the internal readline state too
          }
          this.cursor = this.cursor === 2 ? 0 : this.cursor + 1;
          break;
      }
      this.updateValue();
    });

    // Listen for user input changes (when typing)
    this.on("userInput", (input: string) => {
      if (this.isTyping) {
        this.value = input || "Enter value...";
      }
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return; // Guard against undefined info

      // If any printable character is pressed and we're not already typing,
      // jump to the text input option and start typing
      if (
        char &&
        char.length === 1 &&
        !info.ctrl &&
        !info.meta &&
        !this.isTyping
      ) {
        const isArrowKey = ["up", "down", "left", "right"].includes(
          info.name || ""
        );
        const isControlKey = ["return", "enter", "escape", "tab"].includes(
          info.name || ""
        );

        if (!isArrowKey && !isControlKey) {
          this.cursor = 2;
          this.isTyping = true;
          // Enable value tracking and set the initial character
          (this as any)._track = true;
          this._setUserInput(char);
          this.updateValue();
          return;
        }
      }

      if (this.cursor === 2) {
        // Third option - text input
        if (info.name === "escape") {
          // Exit typing mode
          this.isTyping = false;
          (this as any)._track = false;
          this._clearUserInput(); // Clear the internal readline state
          this.updateValue();
          return; // Prevent default Escape behavior
        }
      }
    });
  }

  private updateValue() {
    if (!this.isTyping) {
      if (this.cursor === 0) {
        this.value = this.options.current;
      } else if (this.cursor === 1) {
        this.value = this.options.default;
      } else if (this.cursor === 2) {
        this.value = "Enter value...";
      }
    } else {
      this.value = this.userInput || "Enter value...";
    }
  }
}
