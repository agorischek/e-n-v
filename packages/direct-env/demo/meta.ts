import { load, EnvMeta, schema } from "../src/index";
import { writeFile, unlink } from "node:fs/promises";

async function demo() {
  const testPath = ".env.meta-demo";

  try {
    // Create a demo .env file
    await writeFile(
      testPath,
      `PORT=9000
API_URL=https://api.example.com
TIMEOUT=30
`
    );

    console.log("🔧 Creating reusable EnvMeta instance...\n");

    // Create metadata once
    const meta = new EnvMeta({
      path: testPath,
      vars: {
        PORT: schema.number(),
        API_URL: schema.string(),
        TIMEOUT: schema.number({ default: 10 }),
      },
    });

    console.log(`  Channel: ${meta.channel.constructor.name}`);
    console.log(`  Path: ${meta.path}`);
    console.log(`  Schemas: ${Object.keys(meta.schemas).join(", ")}\n`);

    // Load multiple times with different options
    console.log("📥 Loading with strict mode (default)...");
    const env1 = await load(meta);
    console.log(`  PORT: ${env1.PORT}`);
    console.log(`  API_URL: ${env1.API_URL}`);
    console.log(`  TIMEOUT: ${env1.TIMEOUT}\n`);

    // Load again with custom preprocessing
    console.log("📥 Loading with custom preprocessing...");
    const env2 = await load(meta, {
      preprocess: {
        number: (value) => {
          console.log(`    Preprocessing number: "${value}"`);
          return value;
        },
      },
    });
    console.log(`  PORT: ${env2.PORT}`);
    console.log(`  TIMEOUT: ${env2.TIMEOUT}\n`);

    console.log("✅ Same metadata, different loading options!");
  } finally {
    // Clean up
    await unlink(testPath).catch(() => {});
  }
}

demo();
