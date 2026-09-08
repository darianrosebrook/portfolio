// Local verification helper: load private build environment without printing it.
// Pass the environment directory explicitly when building an isolated worktree.
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const { loadEnvConfig } = nextRequire('@next/env');
process.env.NODE_ENV = 'production';
loadEnvConfig(process.argv[2] ?? process.cwd(), false, {
  info() {},
  error() {
    console.error('Build environment could not be loaded');
  },
});
const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 1);
