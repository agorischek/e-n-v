import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { readdir } from "fs/promises";

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
}

interface CheckBundleConfig {
  repoRoot: string;
  packagesDir: string;
  bundlePackageName: string;
  bundledPrefixes?: string[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function readPackageJson(filePath: string): Promise<PackageJson> {
  const raw = await Bun.file(filePath).text();
  try {
    return JSON.parse(raw) as PackageJson;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON at ${filePath}: ${(error as Error).message}`,
    );
  }
}

async function readConfig(filePath: string): Promise<CheckBundleConfig> {
  const raw = await Bun.file(filePath).text();
  try {
    return Bun.YAML.parse(raw) as CheckBundleConfig;
  } catch (error) {
    throw new Error(
      `Failed to parse YAML config at ${filePath}: ${(error as Error).message}`,
    );
  }
}

function matchesPrefix(value: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

async function main(): Promise<void> {
  const startedAt = performance.now();
  try {
    const configRelativePath = path.join("check-bundle", "config.yaml");
    const configPath = path.join(__dirname, configRelativePath);
    const config = await readConfig(configPath);

    if (!config.repoRoot) {
      throw new Error(`Missing "repoRoot" in ${configRelativePath}`);
    }
    if (!config.packagesDir) {
      throw new Error(`Missing "packagesDir" in ${configRelativePath}`);
    }

    if (!config.bundlePackageName) {
      throw new Error(`Missing "bundlePackageName" in ${configRelativePath}`);
    }

    const repoRoot = path.resolve(__dirname, config.repoRoot);
    const packagesDir = path.join(repoRoot, config.packagesDir);
    const bundlePackageName = config.bundlePackageName;
    const bundledPrefixes = Array.isArray(config.bundledPrefixes)
      ? config.bundledPrefixes
      : [];
    const disallowBundleDependencyPrefixes = bundledPrefixes;

    const entries = await readdir(packagesDir, { withFileTypes: true }).catch(
      () => {
        throw new Error(`Failed to read packages directory at ${packagesDir}`);
      },
    );

    const problems: string[] = [];
    const packageJsonPaths: Array<{ name: string; path: string }> = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(
        packagesDir,
        entry.name,
        "package.json",
      );
      const packageJsonFile = Bun.file(packageJsonPath);
      if (await packageJsonFile.exists()) {
        packageJsonPaths.push({ name: entry.name, path: packageJsonPath });
      } else {
        problems.push(
          `Missing package.json for package "${entry.name}" at ${packageJsonPath}`,
        );
      }
    }

    if (packageJsonPaths.length === 0) {
      throw new Error(
        "No package.json files found under packages/*/package.json",
      );
    }

    const bundleEntry = packageJsonPaths.find(
      (pkg) => pkg.name === bundlePackageName,
    );
    if (!bundleEntry) {
      throw new Error(
        `Bundle package "${bundlePackageName}" not found under packages/*`,
      );
    }

    const bundlePackage = await readPackageJson(bundleEntry.path);
    const bundleDependencies = bundlePackage.dependencies ?? {};

    for (const dep of Object.keys(bundleDependencies)) {
      if (matchesPrefix(dep, disallowBundleDependencyPrefixes)) {
        problems.push(
          `Bundle package must not declare internal dependency "${dep}".`,
        );
      }
    }

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
        if (matchesPrefix(dep, bundledPrefixes)) {
          continue;
        }
        const bundleVersion = bundleDependencies[dep];
        if (bundleVersion === undefined) {
          problems.push(
            `Dependency "${dep}" (version ${version}) required by "${pkg.name}" is missing from bundle package dependencies.`,
          );
          continue;
        }

        if (bundleVersion !== version) {
          problems.push(
            `Dependency "${dep}" version mismatch: "${pkg.name}" requires ${version} but bundle declares ${bundleVersion}.`,
          );
        }
      }
    }

    if (problems.length > 0) {
      const details = problems
        .map((problem, index) => `${index + 1}. ${problem}`)
        .join("\n");
      throw new Error(`Bundle dependency check failed:\n${details}`);
    }

    console.log(
      "Bundle dependencies include all workspace dependencies with matching versions.",
    );
  } finally {
    const durationMs = performance.now() - startedAt;
    console.log(`Script completed in ${durationMs.toFixed(2)}ms`);
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
