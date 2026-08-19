import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "storage_units_features" CASCADE;
  DROP TABLE IF EXISTS "storage_units" CASCADE;

  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "storage_units_id";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Intentionally irreversible: storage-units was a dead, duplicate collection —
  // confirmed via code search that the live stor24 marketing site never read from
  // it (real unit/pricing data comes from stor24-portal's public API, see
  // PROJECT_CONTEXT.md, "Ownership decision"). If this needs to be rolled back,
  // restore from the pre-migration database backup instead.
}
