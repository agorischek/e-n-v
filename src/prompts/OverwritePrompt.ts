import { cursor } from 'sisteransi';
import { ThemedPrompt, ThemedPromptOptions } from "./ThemedPrompt";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../visuals/symbols";

interface OverwriteOptions extends ThemedPromptOptions {
  message: string;
}

export class OverwritePrompt extends ThemedPrompt<boolean> {
  get cursor() {
    return this.value ? 0 : 1;
  }

  private get _value() {
    return this.cursor === 0;
  }

  constructor(opts: OverwriteOptions) {
    super({
      ...opts,
      render: function (this: OverwritePrompt) {
        const title = `${this.getSymbol()}  ${opts.message}\n`;
        
        switch (this.state) {
          case 'submit':
            const actionMessage = this.value ? 'Overwriting' : 'Exiting';
            return `${this.getSymbol()}  ${actionMessage}\n${this.colors.subtle(this.getBar())}`;
          case 'cancel':
            const value = this.value ? 'Overwrite' : 'Exit';
            return `${title}${this.colors.subtle(this.getBar())}  ${this.colors.strikethrough(
              this.colors.dim(value)
            )}\n${this.colors.subtle(this.getBar())}`;
          default: {
            return `${title}${this.getBar()}  ${
              this.value
                ? `${this.theme.primary(S_RADIO_ACTIVE)} Overwrite`
                : `${this.colors.dim(S_RADIO_INACTIVE)} ${this.colors.dim('Overwrite')}`
            } ${this.colors.dim('/')} ${
              !this.value
                ? `${this.theme.primary(S_RADIO_ACTIVE)} Exit`
                : `${this.colors.dim(S_RADIO_INACTIVE)} ${this.colors.dim('Exit')}`
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