#!/usr/bin/env node

import { run } from "@e-n-v/cli";

run(process.argv).catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
