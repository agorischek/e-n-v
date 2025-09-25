import { text, confirm, select } from "@clack/prompts";

async function testClackStyling() {
  const name = await text({
    message: "What's your name?",
  });
  
  const age = await select({
    message: "Select your age range",
    options: [
      { value: "18-25", label: "18-25 years" },
      { value: "26-35", label: "26-35 years" },
      { value: "36+", label: "36+ years" },
    ],
  });
  
  const confirm_result = await confirm({
    message: "Are you sure?",
  });
  
  console.log({ name, age, confirm_result });
}

testClackStyling().catch(console.error);