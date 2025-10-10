/**
 * Stryker configuration for the envrw package, extending the shared base config.
 */
const baseConfig = require('../../stryker.config.base.js');

/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
const config = {
  ...baseConfig
};

module.exports = config;
