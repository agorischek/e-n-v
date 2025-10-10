/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
const config = {
  $schema: './node_modules/@stryker-mutator/core/schema/stryker-schema.json',
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'command',
  commandRunner: {
    command: 'bun test'
  },
  testRunner_comment:
    "Take a look at (missing 'homepage' URL in package.json) for information about the command plugin.",
  coverageAnalysis: 'off'
};

module.exports = config;
