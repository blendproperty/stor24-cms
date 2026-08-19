import * as migration_20260613_161747_storage_insights_init from './20260613_161747_storage_insights_init';
import * as migration_20260616_142929 from './20260616_142929';
import * as migration_20260818_120000_remove_crm_collections from './20260818_120000_remove_crm_collections';
import * as migration_20260819_054800_remove_storage_units from './20260819_054800_remove_storage_units';

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
  {
    up: migration_20260818_120000_remove_crm_collections.up,
    down: migration_20260818_120000_remove_crm_collections.down,
    name: '20260818_120000_remove_crm_collections'
  },
  {
    up: migration_20260819_054800_remove_storage_units.up,
    down: migration_20260819_054800_remove_storage_units.down,
    name: '20260819_054800_remove_storage_units'
  },
];
