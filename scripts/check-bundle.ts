import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const bundlePackageName = 'bundle';

async function readPackageJson(filePath: string): Promise<PackageJson> {
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw) as PackageJson;
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${(error as Error).message}`);
  }
}

async function main(): Promise<void> {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });

  const problems: string[] = [];
  const packageJsonPaths: Array<{ name: string; path: string }> = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json');
    try {
      await fs.access(packageJsonPath);
      packageJsonPaths.push({ name: entry.name, path: packageJsonPath });
    } catch {
      problems.push(`Missing package.json for package "${entry.name}" at ${packageJsonPath}`);
    }
  }

  if (packageJsonPaths.length === 0) {
    throw new Error('No package.json files found under packages/*/package.json');
  }

  const bundleEntry = packageJsonPaths.find((pkg) => pkg.name === bundlePackageName);
  if (!bundleEntry) {
    throw new Error(`Bundle package "${bundlePackageName}" not found under packages/*`);
  }

  const bundlePackage = await readPackageJson(bundleEntry.path);
  const bundleDependencies = bundlePackage.dependencies ?? {};

  for (const pkg of packageJsonPaths) {
    if (pkg.name === bundlePackageName) {
      continue;
    }

    const packageJson = await readPackageJson(pkg.path);
    const deps = packageJson.dependencies;

    if (!deps || Object.keys(deps).length === 0) {
      continue;
    }

    for (const [dep, version] of Object.entries(deps)) {
      if (dep.startsWith('@e-n-v/')) {
        continue;
      }
      const bundleVersion = bundleDependencies[dep];
      if (bundleVersion === undefined) {
        problems.push(
          `Dependency "${dep}" (version ${version}) required by "${pkg.name}" is missing from bundle package dependencies.`
        );
        continue;
      }

      if (bundleVersion !== version) {
        problems.push(
          `Dependency "${dep}" version mismatch: "${pkg.name}" requires ${version} but bundle declares ${bundleVersion}.`
        );
      }
    }
  }

  if (problems.length > 0) {
    const details = problems.map((problem, index) => `${index + 1}. ${problem}`).join('\n');
    throw new Error(`Bundle dependency check failed:\n${details}`);
  }

  console.log('Bundle dependencies include all workspace dependencies with matching versions.');
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
