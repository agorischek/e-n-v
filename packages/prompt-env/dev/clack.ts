import { isCancel, cancel, text } from "@clack/prompts";

const value = await text({
  message: "What is the meaning of life?",
});

if (isCancel(value)) {
  cancel("Operation cancelled.");
  process.exit(0);
}
