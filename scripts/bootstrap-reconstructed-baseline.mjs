import pg from 'pg';
import { readFile } from 'node:fs/promises';

// This reconstruction is limited to a named synthetic database; it is not a production recovery procedure.
if (process.env.CMS_BASELINE_TEST !== 'isolated-ci') throw new Error('Explicit isolated staging opt-in required');
let url;
try { url = new URL(process.env.MIGRATION_DATABASE_URL); } catch { throw new Error('Invalid staging database URL'); }
if (url.hostname !== 'localhost' || url.port !== '55481' || url.pathname !== '/cms_baseline_replay_ci' || url.username !== 'stage_owner' || url.search) throw new Error('Refusing non-synthetic staging database');
const client = new pg.Client({ connectionString: url.toString() });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(hashtext('stor24-cms-reconstructed-baseline'))");
  const objects = await client.query(`SELECT
    (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f')) +
    (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype IN ('e','d','c')) +
    (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public') AS count`);
  if (Number(objects.rows[0].count) !== 0) throw new Error('Refusing non-empty public schema');
  const sql = await readFile(new URL('./cms-baseline-reconstructed.sql', import.meta.url), 'utf8');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Synthetic reconstructed baseline applied; historical migrations are not marked as applied');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Synthetic baseline bootstrap failed');
  process.exitCode = 1;
} finally { await client.end(); }
