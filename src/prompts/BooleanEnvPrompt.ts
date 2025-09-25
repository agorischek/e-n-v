import { SelectPrompt, isCancel } from '@clack/core';
import color from 'picocolors';

export interface BooleanSettings {
  default?: boolean;
  current?: boolean;
  optional: boolean;
  description?: string;
  key: string;
}

interface BooleanOption {
  value: boolean | null;
  label: string;
  icon: string;
  colorFn: (text: string) => string;
}

export default class BooleanEnvPrompt extends SelectPrompt<BooleanOption> {
  settings: BooleanSettings;

  constructor(settings: BooleanSettings) {
    // Build options array - always include skip option
    const options: BooleanOption[] = [
      {
        value: true,
        label: 'true',
        icon: '✓',
        colorFn: color.green
      },
      {
        value: false,
        label: 'false',
        icon: '✗',
        colorFn: color.red
      },
      {
        value: null,
        label: 'skip',
        icon: '⏭',
        colorFn: color.white
      }
    ];

    // Find initial value by finding the matching option's value
    let initialValue: boolean | null = true;
    if (settings.current !== undefined) {
      initialValue = settings.current;
    } else if (settings.default !== undefined) {
      initialValue = settings.default;
    }

    super({
      options,
      initialValue,
      render() {
        const { key, description, current, default: defaultValue, optional } = settings;
        
        if (this.state === 'submit') {
          const selectedValue = this.value;
          if (selectedValue === null) {
            // If skipped, show only the key with no value
            return `${color.bold(color.white(key))}`;
          } else {
            // Show the selected value in dim color
            const valueText = selectedValue === true ? 'true' : 'false';
            return `${color.bold(color.white(key))}\u00A0${color.dim(valueText)}`;
          }
        }

        let output = '';
        
        // Key in bold white
        output += color.bold(color.white(key));
        
        // Description in dimmed text if present, with optional indicator
        if (description) {
          const optionalSuffix = optional ? ' (optional)' : '';
          output += `\u00A0${color.dim(description + optionalSuffix)}`;
        } else if (optional) {
          output += `\u00A0${color.dim('(optional)')}`;
        }
        
        output += '\n';

        // Render options
        this.options.forEach((option, index) => {
          const isSelected = index === this.cursor;
          const { label, icon, colorFn } = option;
          
          let annotations = [];
          
          // Check for current annotation
          if (current === option.value && option.value !== null) {
            annotations.push('current');
          }
          
          // Check for default annotation
          if (defaultValue === option.value && option.value !== null) {
            annotations.push('default');
          }
          
          let annotationText = '';
          if (annotations.length > 0) {
            annotationText = `\u00A0(${annotations.join(', ')})`;
          }
          
          if (isSelected) {
            output += `${colorFn(icon)} ${colorFn(label)}${color.dim(annotationText)}\n`;
          } else {
            // Use a transparent/invisible character to maintain alignment
            output += `\u00A0\u00A0${color.dim(label)}${color.dim(annotationText)}\n`;
          }
        });

        if (this.error) {
          output += `\n${color.red(this.error)}`;
        }

        return output;
      }
    });

    this.settings = settings;
  }
}

// Convenience function
export async function booleanPrompt(settings: BooleanSettings): Promise<boolean | null | symbol> {
  const prompt = new BooleanEnvPrompt(settings);
  const result = await prompt.prompt();
  
  if (isCancel(result)) {
    return result;
  }
  
  // SelectPrompt returns the value, but we need to convert properly
  return result as unknown as boolean | null;
}

// Re-export isCancel from core for convenience
export { isCancel };