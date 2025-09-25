import { Prompt, isCancel } from "@clack/core";
import type { Key } from "node:readline";
import color from "picocolors";
import { EnvPromptOptions } from "../EnvPromptOptions";
import { SKIP_SYMBOL } from "../symbols";

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
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray
              return `${color.gray(color.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format
            return `${color.bold(color.white(opts.key))}${color.gray("=")}${color.white(this.value)}`;
          }

          let output = "";

          // Add header line with key in bold white and description in gray if provided
          output += color.bold(color.white(opts.key));
          if (opts.description) {
            output += ` ${color.gray(opts.description)}`;
          }
          output += "\n";

          // Create options array based on whether current and default are the same
          const isSame = opts.current === opts.default;
          const options = isSame 
            ? [{ value: opts.current, label: "(current, default)" }, "Enter value..."]
            : [
                { value: opts.current, label: "(current)" },
                { value: opts.default, label: "(default)" },
                "Enter value..."
              ];

          options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected ? color.green("●") : color.dim("○");

            if (typeof option === "string") {
              // "Enter value..." option
              if (this.isTyping) {
                const displayText = `${this.userInput}█`;
                output += `${circle} ${color.white(displayText)}\n`;
              } else if (isSelected) {
                // Show cursor immediately when selected, even before typing
                output += `${circle} ${color.white("█")}\n`;
              } else {
                // "Enter value..." is gray when not selected
                output += `${circle} ${color.gray(option)}\n`;
              }
            } else {
              // Current/Default options
              const text = isSelected ? color.white(option.value) : color.gray(option.value);
              const suffix = color.gray(` ${option.label}`);
              output += `${circle} ${text}${suffix}\n`;
            }
          });

          return output;
        },
        validate: (value) => {
          const isSame = this.options.current === this.options.default;
          const textInputIndex = isSame ? 1 : 2;
          
          // If we're on the custom entry option but not typing yet, prevent submission
          if (this.cursor === textInputIndex && !this.isTyping) {
            // Start typing mode instead of submitting
            this.isTyping = true;
            (this as any)._track = true;
            this._setUserInput("");
            this.updateValue();
            return "Starting input mode"; // This will cause validation to fail and stay active
          }

          // If we're typing on the custom option but haven't entered anything, prevent submission
          if (
            this.cursor === textInputIndex &&
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
          const isSame = this.options.current === this.options.default;
          const maxIndex = isSame ? 1 : 2;
          
          // If we're typing or on the text option, clear input and exit typing mode
          if (this.isTyping || this.cursor === maxIndex) {
            this.isTyping = false;
            (this as any)._track = false;
            this._clearUserInput(); // This clears the internal readline state too
          }
          this.cursor = this.cursor === 0 ? maxIndex : this.cursor - 1;
          break;
        case "down":
          const isSameDown = this.options.current === this.options.default;
          const maxIndexDown = isSameDown ? 1 : 2;
          
          // If we're typing or on the text option, clear input and exit typing mode
          if (this.isTyping || this.cursor === maxIndexDown) {
            this.isTyping = false;
            (this as any)._track = false;
            this._clearUserInput(); // This clears the internal readline state too
          }
          this.cursor = this.cursor === maxIndexDown ? 0 : this.cursor + 1;
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

      // Handle tab key specifically - return SKIP_SYMBOL immediately
      if (info.name === "tab") {
        this.value = SKIP_SYMBOL as any;
        this.state = "submit";
        return;
      }

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
          const isSame = this.options.current === this.options.default;
          this.cursor = isSame ? 1 : 2; // Jump to the "Enter value..." option
          this.isTyping = true;
          // Enable value tracking and set the initial character
          (this as any)._track = true;
          this._setUserInput(char);
          this.updateValue();
          return;
        }
      }

      const isSame = this.options.current === this.options.default;
      const textInputIndex = isSame ? 1 : 2;
      
      if (this.cursor === textInputIndex) {
        // Text input option
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
      const isSame = this.options.current === this.options.default;
      
      if (this.cursor === 0) {
        this.value = this.options.current;
      } else if (!isSame && this.cursor === 1) {
        this.value = this.options.default;
      } else {
        // This is the "Enter value..." option (index 1 when same, index 2 when different)
        this.value = "Enter value...";
      }
    } else {
      this.value = this.userInput || "Enter value...";
    }
  }
}
