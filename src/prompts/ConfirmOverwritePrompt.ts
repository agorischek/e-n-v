import { cursor } from 'sisteransi';
import color from 'picocolors';
import { ThemedPrompt, ThemedPromptOptions } from "../ThemedPrompt";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../symbols";

interface ConfirmOverwriteOptions extends ThemedPromptOptions {
  message: string;
}

export class ConfirmOverwritePrompt extends ThemedPrompt<boolean> {
  get cursor() {
    return this.value ? 0 : 1;
  }

  private get _value() {
    return this.cursor === 0;
  }

  constructor(opts: ConfirmOverwriteOptions) {
    super({
      ...opts,
      render: function (this: ConfirmOverwritePrompt) {
        const title = `${this.getSymbol()}  ${opts.message}\n`;
        
        switch (this.state) {
          case 'submit':
            const actionMessage = this.value ? 'Overwriting' : 'Exiting';
            return `${this.getSymbol()}  ${actionMessage}\n${color.gray(this.getBar())}`;
          case 'cancel':
            const value = this.value ? 'Overwrite' : 'Exit';
            return `${title}${color.gray(this.getBar())}  ${color.strikethrough(
              color.dim(value)
            )}\n${color.gray(this.getBar())}`;
          default: {
            return `${title}${this.getBar()}  ${
              this.value
                ? `${color.green(S_RADIO_ACTIVE)} Overwrite`
                : `${color.dim(S_RADIO_INACTIVE)} ${color.dim('Overwrite')}`
            } ${color.dim('/')} ${
              !this.value
                ? `${color.green(S_RADIO_ACTIVE)} Exit`
                : `${color.dim(S_RADIO_INACTIVE)} ${color.dim('Exit')}`
            }\n${this.getBarEnd()}\n`;
          }
        }
      }
    }, false);
    
    this.value = true; // Default to 'Overwrite' (true)

    this.on('userInput', () => {
      this.value = this._value;
    });

    this.on('confirm', (confirm) => {
      this.output.write(cursor.move(0, -1));
      this.value = confirm;
      this.state = 'submit';
      this.close();
    });

    this.on('cursor', () => {
      this.value = !this.value;
    });
  }
}