import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
 await db.execute(sql`CREATE TABLE "micro_warehousing" (
 "id" serial PRIMARY KEY NOT NULL, "published" boolean DEFAULT false,
 "headline" varchar DEFAULT 'Your business grows.', "accent" varchar DEFAULT 'Weâ€™ve got room.',
 "intro" varchar, "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
 "compact_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
 "growing_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
 "large_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
 "details_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
 "seo_title" varchar, "seo_description" varchar, "content" jsonb,
 "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
 "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
 );`)
}
export async function down({ db }: MigrateDownArgs): Promise<void> { await db.execute(sql`DROP TABLE "micro_warehousing";`) }
