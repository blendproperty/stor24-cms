import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const baseline = 'scripts/bootstrap-reconstructed-baseline.mjs';
const local = 'postgresql://stage_owner:synthetic-owner-only@localhost:55481/cms_baseline_replay_ci';
for (const [name, env] of [
  ['missing opt-in', { MIGRATION_DATABASE_URL: local }],
  ['remote host', { CMS_BASELINE_TEST: 'isolated-ci', MIGRATION_DATABASE_URL: 'postgresql://stage_owner:synthetic-owner-only@example.invalid:55481/cms_baseline_replay_ci' }],
  ['wrong database', { CMS_BASELINE_TEST: 'isolated-ci', MIGRATION_DATABASE_URL: 'postgresql://stage_owner:synthetic-owner-only@localhost:55481/production' }],
  ['URL target override', { CMS_BASELINE_TEST: 'isolated-ci', MIGRATION_DATABASE_URL: local + '?host=example.invalid' }],
]) test(`synthetic CMS baseline rejects ${name} before connecting`, () => {
  const vars = { ...process.env, ...env };
  if (!('CMS_BASELINE_TEST' in env)) delete vars.CMS_BASELINE_TEST;
  const child = spawnSync(process.execPath, [baseline], { env: vars, encoding: 'utf8', timeout: 5000 });
  assert.equal(child.status, 1);
  assert.doesNotMatch(child.stderr, /synthetic-owner-only/);
});
