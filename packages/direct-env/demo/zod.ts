import { load } from "../src/index";
import { z } from "zod";
import { writeFile, unlink } from "node:fs/promises";

async function demo() {
  const testPath = ".env.zod-demo";

  try {
    // Create a demo .env file
    await writeFile(
      testPath,
      `PORT=8080
API_URL=https://api.example.com
DATABASE_URL=postgres://user:pass@localhost:5432/db
NODE_ENV=production
MAX_RETRIES=3
ENABLE_CACHE=true
`
    );

    console.log("🔍 Loading with Zod schemas...\n");

    // Load and validate with Zod
    const env = await load({
      path: testPath,
      vars: {
        PORT: z.number().min(1024).max(65535),
        API_URL: z.string().url(),
        DATABASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "production", "test"]),
        MAX_RETRIES: z.number().min(0).max(10),
        ENABLE_CACHE: z.boolean(),
      },
    });

    console.log("✅ Successfully validated with Zod:\n");
    console.log(`  PORT: ${env.PORT} (validated: 1024-65535)`);
    console.log(`  API_URL: ${env.API_URL} (validated: URL format)`);
    console.log(`  DATABASE_URL: ${env.DATABASE_URL} (validated: URL format)`);
    console.log(`  NODE_ENV: ${env.NODE_ENV} (validated: enum)`);
    console.log(`  MAX_RETRIES: ${env.MAX_RETRIES} (validated: 0-10)`);
    console.log(`  ENABLE_CACHE: ${env.ENABLE_CACHE} (validated: boolean)`);

    console.log("\n✅ Type-safe and validated with Zod!");
  } finally {
    // Clean up
    await unlink(testPath).catch(() => {});
  }
}

demo();
