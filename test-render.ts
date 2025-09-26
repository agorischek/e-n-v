import { NumberEnvPrompt } from "./src/prompts/NumberEnvPrompt";

async function quickTest() {
  console.log("Quick test of NumberEnvPrompt with L-shaped pipe...\n");

  const prompt = new NumberEnvPrompt({
    key: "TEST_PORT",
    description: "Test port (should show └ with 'Enter a number' in gray)",
    required: true
  });

  // Let's just render the prompt once to see the output
  console.log("Here's how the prompt renders:");
  console.log("================================");
  
  // Access the internal render method to show the output
  const rendered = (prompt as any).render();
  console.log(rendered);
  console.log("================================");
  
  console.log("\nYou should see:");
  console.log("- A diamond (◆) with TEST_PORT in white");
  console.log("- Description in gray");
  console.log("- A vertical pipe (│) with a cursor");
  console.log("- An L-shaped pipe (└) with 'Enter a number' in light gray");
}

quickTest().catch(console.error);