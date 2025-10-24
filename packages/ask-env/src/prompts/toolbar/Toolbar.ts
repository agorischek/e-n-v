import type { Key } from "node:readline";
import type { ToolbarEntry } from "./ToolbarEntry";
import type { ToolbarConfig } from "./ToolbarConfig";
import type { Theme } from "../../visuals/Theme";
import color from "picocolors";
import {
  S_TOOL_ACTIVE,
  S_TOOL_INACTIVE,
} from "../../visuals/symbols";

export class Toolbar {
  private isOpen: boolean = false;
  private cursor: number = 0;
  private config: ToolbarConfig;
  private theme: Theme;

  constructor(
    config: ToolbarConfig,
    theme: Theme,
  ) {
    this.config = config;
    this.theme = theme;
  }

  /**
   * Color utilities for consistent theming
   */
  private get colors() {
    return {
      primary: this.theme.primary,
      subtle: this.theme.subtle,
      warn: this.theme.warn,
      error: this.theme.error,
      // Common colors
      white: color.white,
      bold: color.bold,
      dim: color.dim,
      inverse: color.inverse,
      strikethrough: color.strikethrough,
    };
  }

  public isToolbarOpen(): boolean {
    return this.isOpen;
  }

  public open(): void {
    this.isOpen = true;
    this.cursor = 0;
  }

  public close(): void {
    this.isOpen = false;
    this.cursor = 0;
  }

  public handleKey(char: string | undefined, info: Key): boolean {
    if (!info) {
      return false;
    }

    if (info.name === "tab") {
      if (!this.isOpen) {
        this.open();
      } else {
        this.close();
      }
      return true;
    }

    if (!this.isOpen) {
      return false;
    }

    switch (info.name) {
      case "left":
      case "up":
        this.shiftCursor(-1);
        return true;
      case "right":
      case "down":
        this.shiftCursor(1);
        return true;
      case "return":
      case "enter":
        this.activateOption();
        return true;
      case "escape":
        this.close();
        return true;
      case "backspace":
        this.close();
        return false;
    }

    if (char && char.length === 1 && !info.ctrl && !info.meta) {
      this.close();
      return false;
    }

    return false;
  }

  public render(): string {
    if (!this.isOpen) {
      return "";
    }

    const options = this.getOptions();
    this.ensureCursor(options);
    if (!options.length) {
      return this.colors.subtle("");
    }

    const separator = this.colors.subtle(" / ");
    const optionStrings = options.map((option, index) => {
      const isFocused = index === this.cursor;
      const icon = isFocused
        ? (option.activeIcon ?? option.icon)
        : option.icon;
      const label = icon ? `${icon} ${option.label}` : option.label;

      return isFocused
        ? this.theme.primary(label)
        : this.colors.subtle(label);
    });

    return optionStrings.join(separator);
  }

  public updateConfig(config: Partial<ToolbarConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shiftCursor(delta: number): void {
    const options = this.getOptions();
    if (!options.length) {
      return;
    }

    let nextIndex = this.cursor;
    const len = options.length;
    for (let step = 0; step < len; step++) {
      nextIndex = (nextIndex + delta + len) % len;
      this.cursor = nextIndex;
      return;
    }
  }

  private activateOption(): void {
    const options = this.getOptions();
    this.ensureCursor(options);
    const selected = options[this.cursor];
    if (!selected) {
      return;
    }

    // Close toolbar first (except for toggleSecret which handles its own timing)
    if (selected.key !== "toggleSecret") {
      this.close();
    }
    
    // Execute the action
    selected.action();
    
    // Close toolbar after toggleSecret action
    if (selected.key === "toggleSecret") {
      this.close();
    }
  }

  private ensureCursor(options: ToolbarEntry[]): void {
    if (!options.length) {
      this.cursor = 0;
      return;
    }

    if (this.cursor >= options.length) {
      this.cursor = 0;
    }
  }

  private getOptions(): ToolbarEntry[] {
    const options: ToolbarEntry[] = [
      {
        key: "skip",
        label: "Skip",
        icon: S_TOOL_INACTIVE,
        activeIcon: S_TOOL_ACTIVE,
        action: this.config.actions.skip,
      },
    ];

    if (this.config.index > 0) {
      options.push({
        key: "previous",
        label: "Previous",
        icon: S_TOOL_INACTIVE,
        activeIcon: S_TOOL_ACTIVE,
        action: this.config.actions.previous,
      });
    }

    if (this.config.secret) {
      options.push({
        key: "toggleSecret",
        label: this.config.isSecretRevealed ? "Hide" : "Show",
        icon: S_TOOL_INACTIVE,
        activeIcon: S_TOOL_ACTIVE,
        action: this.config.actions.toggleSecret,
      });
    }

    options.push({
      key: "close",
      label: "Return",
      icon: S_TOOL_INACTIVE,
      activeIcon: S_TOOL_ACTIVE,
      action: this.config.actions.close,
    });

    return options;
  }
}