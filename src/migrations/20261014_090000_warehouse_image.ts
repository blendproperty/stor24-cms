import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "micro_warehousing" ADD COLUMN "warehouse_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "micro_warehousing" DROP COLUMN "warehouse_image_id";`)
}
