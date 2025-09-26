import { ConfirmPrompt } from '@clack/core';
import color from 'picocolors';
import { defaultThemeColor } from "../EnvPromptOptions";
import { S_BAR, S_BAR_END, S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../symbols";
import { symbol } from "../symbolUtils";

interface ConfirmOverwriteOptions {
  message: string;
  themeColor?: (text: string) => string;
}

export class ConfirmOverwritePrompt extends ConfirmPrompt {
  constructor(opts: ConfirmOverwriteOptions) {
    const themeColor = opts.themeColor || defaultThemeColor;

    super({
      active: 'Overwrite',
      inactive: 'Exit',
      initialValue: true,
      render: function (this: ConfirmOverwritePrompt) {
        const title = `${symbol(this.state, themeColor)}  ${opts.message}\n`;
        
        switch (this.state) {
          case 'submit':
            const actionMessage = this.value ? 'Overwriting' : 'Exiting';
            return `${symbol(this.state, themeColor)}  ${actionMessage}\n${color.gray(S_BAR)}`;
          case 'cancel':
            const value = this.value ? 'Overwrite' : 'Exit';
            return `${title}${color.gray(S_BAR)}  ${color.strikethrough(
              color.dim(value)
            )}\n${color.gray(S_BAR)}`;
          default: {
            return `${title}${themeColor(S_BAR)}  ${
              this.value
                ? `${color.green(S_RADIO_ACTIVE)} Overwrite`
                : `${color.dim(S_RADIO_INACTIVE)} ${color.dim('Overwrite')}`
            } ${color.dim('/')} ${
              !this.value
                ? `${color.green(S_RADIO_ACTIVE)} Exit`
                : `${color.dim(S_RADIO_INACTIVE)} ${color.dim('Exit')}`
            }\n${themeColor(S_BAR_END)}\n`;
          }
        }
      },
    });
  }
}