import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "micro_warehousing"
    ADD COLUMN "distribution_hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
    ADD COLUMN "bulk_hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "micro_warehousing" DROP COLUMN "distribution_hero_image_id", DROP COLUMN "bulk_hero_image_id";`)
}
