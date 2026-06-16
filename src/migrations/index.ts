import * as migration_20260613_161747_storage_insights_init from './20260613_161747_storage_insights_init';
import * as migration_20260616_142929 from './20260616_142929';

export const migrations = [
  {
    up: migration_20260613_161747_storage_insights_init.up,
    down: migration_20260613_161747_storage_insights_init.down,
    name: '20260613_161747_storage_insights_init',
  },
  {
    up: migration_20260616_142929.up,
    down: migration_20260616_142929.down,
    name: '20260616_142929'
  },
];
