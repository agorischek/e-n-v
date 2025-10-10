import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { EnvSource } from "../EnvSource.ts";

export async function createTempEnvPath() {
  const dir = await mkdtemp(join(tmpdir(), "envrw-"));
  return join(dir, ".env");
}

export async function createTempEnvSource() {
  const envPath = await createTempEnvPath();
  const source = new EnvSource(envPath);
  return { envPath, source } as const;
}
