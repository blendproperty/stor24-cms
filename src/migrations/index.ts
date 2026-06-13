import * as migration_20260613_161747_storage_insights_init from './20260613_161747_storage_insights_init';

export const migrations = [
  {
    up: migration_20260613_161747_storage_insights_init.up,
    down: migration_20260613_161747_storage_insights_init.down,
    name: '20260613_161747_storage_insights_init'
  },
];
