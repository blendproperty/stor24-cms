import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "no_index" boolean DEFAULT false;
    ALTER TABLE "storage_insights" ADD COLUMN IF NOT EXISTS "no_index" boolean DEFAULT false;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Roll back the application image while retaining editor search-indexing choices; do not drop live editorial data.')
}
