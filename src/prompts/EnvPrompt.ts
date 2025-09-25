import { Prompt, isCancel } from "@clack/core";
import type { Key } from "node:readline";
import color from "picocolors";
import { EnvPromptOptions } from "../EnvPromptOptions";
import { SKIP_SYMBOL } from "../symbols";

type Action = "up" | "down" | "left" | "right" | "space" | "enter" | "cancel";

export abstract class EnvPrompt<T> extends Prompt<T> {
  cursor = 0;
  isTyping = false;
  private hasAttemptedSubmit = false;
  protected options: EnvPromptOptions<T>;

  constructor(opts: EnvPromptOptions<T>) {
    super(
      {
        ...opts,
        render: function (this: EnvPrompt<T>) {
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray
              return `${color.gray(color.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format
            return `${color.bold(color.white(opts.key))}${color.gray(
              "="
            )}${color.white(this.formatValue(this.value))}`;
          }

          let output = "";

          // Add header line with key in bold white and description in gray if provided
          output += color.bold(color.white(opts.key));
          if (opts.description) {
            output += ` ${color.gray(opts.description)}`;
          }
          output += "\n";

          // If both current and default are undefined, show only text input
          if (opts.current === undefined && opts.default === undefined) {
            if (this.isTyping) {
              const displayText = `${this.userInput}█`;
              output += color.white(displayText);
            } else {
              output += color.white("█");
            }
            
            // Add validation output
            output += "\n" + (this.error ? color.yellow(this.error) : "");
            
            return output;
          }

          // Create options array based on whether current and default are the same
          const isSame = opts.current === opts.default;
          const options = isSame
            ? [
                { value: opts.current, label: "(current, default)" },
                "Enter value...",
              ]
            : [
                { value: opts.current, label: "(current)" },
                { value: opts.default, label: "(default)" },
                "Enter value...",
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
              const displayValue = this.formatValue(option.value);
              const text = isSelected
                ? color.white(displayValue)
                : color.gray(displayValue);
              const suffix = isSelected ? color.gray(` ${option.label}`) : "";
              output += `${circle} ${text}${suffix}\n`;
            }
          });

          // Add validation output
          output += this.error ? color.yellow(this.error) : "";

          return output;
        },
        validate: (value) => {
          // If both current and default are undefined, we're in text-only mode
          if (
            this.options.current === undefined &&
            this.options.default === undefined
          ) {
            if (!this.userInput || !this.userInput.trim()) {
              return "Please enter a value";
            }
            // Validate the user input format first
            const inputValidation = this.validateInput(this.userInput);
            if (inputValidation) {
              return inputValidation;
            }
            // If format is valid, run custom validation if provided
            if (this.options.validate) {
              const parsedValue = this.parseInput(this.userInput);
              const customValidation = this.options.validate(parsedValue);
              if (customValidation) {
                return customValidation instanceof Error ? customValidation.message : customValidation;
              }
            }
            return undefined;
          }

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

          // If we're typing, validate the input
          if (this.isTyping && this.userInput) {
            const inputValidation = this.validateInput(this.userInput);
            if (inputValidation) {
              return inputValidation;
            }
            // If format is valid, run custom validation if provided
            if (this.options.validate) {
              const parsedValue = this.parseInput(this.userInput);
              const customValidation = this.options.validate(parsedValue);
              if (customValidation) {
                return customValidation instanceof Error ? customValidation.message : customValidation;
              }
            }
          }

          // For non-typing cases (selecting current/default), validate the selected value
          if (!this.isTyping && this.options.validate && typeof this.value !== 'symbol') {
            const customValidation = this.options.validate(this.value);
            if (customValidation) {
              return customValidation instanceof Error ? customValidation.message : customValidation;
            }
          }

          // All other cases are valid
          return undefined;
        },
      },
      false
    );

    this.options = opts;

    // If both current and default are undefined, start in typing mode
    if (opts.current === undefined && opts.default === undefined) {
      this.isTyping = true;
      (this as any)._track = true;
      this.value = this.getDefaultValue();
    } else {
      // Set initial value to current
      this.value = this.options.current ?? this.getDefaultValue();
    }

    this.on("cursor", (action?: Action) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }
      
      // If both current and default are undefined, we're in text-only mode - no cursor navigation
      if (
        this.options.current === undefined &&
        this.options.default === undefined
      ) {
        return;
      }

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
      // Clear error state when user is typing (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }
      
      if (this.isTyping) {
        try {
          this.value = this.parseInput(input) ?? this.getDefaultValue();
        } catch {
          // If parsing fails, keep the current value but still update display
          // The validation will catch this
        }
      }
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return; // Guard against undefined info

      // Clear error state when user types (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // Handle tab key specifically - return SKIP_SYMBOL immediately
      if (info.name === "tab") {
        this.value = SKIP_SYMBOL as any;
        this.state = "submit";
        return;
      }

      // If both current and default are undefined, we're in text-only mode
      if (
        this.options.current === undefined &&
        this.options.default === undefined
      ) {
        // Already in typing mode, just update the value as the user types
        if (this.isTyping) {
          try {
            this.value = this.parseInput(this.userInput) ?? this.getDefaultValue();
          } catch {
            // Keep current value if parsing fails
          }
        }
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
    // If both current and default are undefined, we're in text-only mode
    if (
      this.options.current === undefined &&
      this.options.default === undefined
    ) {
      try {
        this.value = this.parseInput(this.userInput) ?? this.getDefaultValue();
      } catch {
        this.value = this.getDefaultValue();
      }
      return;
    }

    if (!this.isTyping) {
      const isSame = this.options.current === this.options.default;

      if (this.cursor === 0) {
        this.value = this.options.current ?? this.getDefaultValue();
      } else if (!isSame && this.cursor === 1) {
        this.value = this.options.default ?? this.getDefaultValue();
      } else {
        // This is the "Enter value..." option (index 1 when same, index 2 when different)
        this.value = this.getDefaultValue();
      }
    } else {
      try {
        this.value = this.parseInput(this.userInput) ?? this.getDefaultValue();
      } catch {
        this.value = this.getDefaultValue();
      }
    }
  }

  // Abstract methods that subclasses must implement
  protected abstract formatValue(value: T | undefined): string;
  protected abstract parseInput(input: string): T | undefined;
  protected abstract validateInput(input: string): string | undefined;
  protected abstract getDefaultValue(): T;
}