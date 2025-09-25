import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";

const prompt = new StringEnvPrompt({
  key: "MY_SETTING",
  current: "awesome",
  default: "pretty-cool",
  required: true,
});

await prompt.prompt();
