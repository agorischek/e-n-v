import { ConfirmPrompt } from '@clack/core';
import color from 'picocolors';
import { defaultThemeColor } from "../EnvPromptOptions";
import { S_BAR, S_BAR_END, S_RADIO_ACTIVE, S_RADIO_INACTIVE, S_STEP_ACTIVE, S_STEP_SUBMIT, S_STEP_CANCEL } from "../symbols";
import { symbol } from "../symbolUtils";

interface ConfirmOverwriteOptions {
  message: string;
  active?: string;
  inactive?: string;
  initialValue?: boolean;
  themeColor?: (text: string) => string;
  activeAction?: string; // Custom message when active option is selected
  inactiveAction?: string; // Custom message when inactive option is selected
}

export const confirmOverwrite = (opts: ConfirmOverwriteOptions) => {
  const active = opts.active ?? 'Overwrite';
  const inactive = opts.inactive ?? 'Exit';
  const themeColor = opts.themeColor || defaultThemeColor;

  return new ConfirmPrompt({
    active,
    inactive,
    initialValue: opts.initialValue ?? true,
    render() {
      const title = `${symbol(this.state, themeColor)}  ${opts.message}\n`;
      
      switch (this.state) {
        case 'submit':
          // Show custom action message if provided, otherwise show the selected option
          const actionMessage = this.value 
            ? (opts.activeAction || active)
            : (opts.inactiveAction || inactive);
          return `${symbol(this.state, themeColor)}  ${actionMessage}\n${color.gray(S_BAR)}`;
        case 'cancel':
          const value = this.value ? active : inactive;
          return `${title}${color.gray(S_BAR)}  ${color.strikethrough(
            color.dim(value)
          )}\n${color.gray(S_BAR)}`;
        default: {
          return `${title}${themeColor(S_BAR)}  ${
            this.value
              ? `${color.green(S_RADIO_ACTIVE)} ${active}`
              : `${color.dim(S_RADIO_INACTIVE)} ${color.dim(active)}`
          } ${color.dim('/')} ${
            !this.value
              ? `${color.green(S_RADIO_ACTIVE)} ${inactive}`
              : `${color.dim(S_RADIO_INACTIVE)} ${color.dim(inactive)}`
          }\n${themeColor(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<boolean | symbol>;
};