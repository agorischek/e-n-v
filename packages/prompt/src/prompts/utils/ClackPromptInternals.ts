/** Hacks to access private members of Clack prompts */
export class ClackPromptInternals<TPrompt extends object> {
  private readonly prompt: TPrompt;

  constructor(prompt: TPrompt) {
    this.prompt = prompt;
  }

  public set track(enabled: boolean) {
    (this.prompt as any)._track = enabled;
  }

  public get track(): boolean {
    return (this.prompt as any)._track;
  }
}
