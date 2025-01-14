import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import cwd from 'cwd';
import merge from 'merge-deep';

const exists = promisify(fs.exists);

const DEFAULT_CONFIG = {
  launch: {},
};
const DEFAULT_CONFIG_CI = merge(DEFAULT_CONFIG, {
  launch: {
    args: [],
  },
});

export async function readConfig() {
  const defaultConfig =
    process.env.CI === 'true' ? DEFAULT_CONFIG_CI : DEFAULT_CONFIG;

  const hasCustomConfigPath = !!process.env.JEST_OPENTELEMETRY_CONFIG;
  const configPath =
    process.env.JEST_OPENTELEMETRY_CONFIG || 'jest-opentelemetry.config.js';
  const absConfigPath = path.resolve(cwd(), configPath);
  const configExists = await exists(absConfigPath);

  if (hasCustomConfigPath && !configExists) {
    throw new Error(
      `Error: Can't find a root directory while resolving a config file path.\nProvided path to resolve: ${configPath}`,
    );
  }

  if (!hasCustomConfigPath && !configExists) {
    return defaultConfig;
  }

  const localConfig = await require(absConfigPath);

  return merge({}, defaultConfig, localConfig);
}
