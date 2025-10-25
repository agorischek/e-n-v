import { load, s } from "../src/index";
import { writeFile, unlink } from "node:fs/promises";

async function demo() {
  const testPath = ".env.demo";

  try {
    // Create a demo .env file
    await writeFile(
      testPath,
      `PORT=default
DATABASE_URL=postgres://localhost:5432/mydb
DEBUG=true
MAX_CONNECTIONS=50
API_KEY=secret-key-123
NODE_ENV=developmen
`
    );

    console.log("🔍 Loading environment variables...\n");

    // Load and validate
    const env = await load({
      path: testPath,
      vars: {
        PORT: s.number({ default: 3000 }),
        DATABASE_URL: s.string(),
        DEBUG: s.boolean({ default: false }),
        MAX_CONNECTIONS: s.number(),
        API_KEY: s.string(),
        NODE_ENV: s.enum({ values: ["development", "production", "test"] }),
        OPTIONAL_VAR: s.string({ required: false, default: "fallback" }),
      },
    });

    console.log("✅ Successfully loaded and validated:\n");
    console.log(`  PORT: ${env.PORT} (${typeof env.PORT})`);
    console.log(`  DATABASE_URL: ${env.DATABASE_URL}`);
    console.log(`  DEBUG: ${env.DEBUG} (${typeof env.DEBUG})`);
    console.log(`  MAX_CONNECTIONS: ${env.MAX_CONNECTIONS}`);
    console.log(`  API_KEY: ${env.API_KEY}`);
    console.log(`  NODE_ENV: ${env.NODE_ENV}`);
    console.log(`  OPTIONAL_VAR: ${env.OPTIONAL_VAR} (used default)`);

    console.log("\n✅ process.env was NOT mutated");
    console.log(`  process.env.PORT: ${process.env.PORT}`);
    console.log(`  process.env.DEBUG: ${process.env.DEBUG}`);
  } finally {
    // Clean up
    await unlink(testPath).catch(() => {});
  }
}

demo();
