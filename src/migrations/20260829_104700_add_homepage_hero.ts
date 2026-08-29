import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "homepage_hero" (
      "id" serial PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Storage for Johannesburg' NOT NULL,
      "headline_primary" varchar DEFAULT 'Life happens.' NOT NULL,
      "headline_accent_line_one" varchar DEFAULT 'We’ve got' NOT NULL,
      "headline_accent_line_two" varchar DEFAULT 'room.' NOT NULL,
      "body_copy" varchar DEFAULT 'Moving, growing, renovating or simply running out of cupboards? Tell us what’s taking up space. We’ll help sort the rest.' NOT NULL,
      "rotation_enabled" boolean DEFAULT false,
      "rotation_interval_seconds" numeric DEFAULT 9,
      "cta_eyebrow" varchar DEFAULT 'No idea what size you need?' NOT NULL,
      "cta_strong" varchar DEFAULT 'Good. That’s what we’re here for.' NOT NULL,
      "cta_button_label" varchar DEFAULT 'Find my space' NOT NULL,
      "cta_button_link" varchar DEFAULT '#quote' NOT NULL,
      "benefits_heading" varchar DEFAULT 'Why choose Stor24?' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "homepage_hero_slides" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "desktop_image_id" integer NOT NULL,
      "mobile_image_id" integer,
      "alt" varchar NOT NULL,
      "fit" varchar DEFAULT 'contain' NOT NULL,
      "position" varchar DEFAULT 'center' NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "homepage_hero_benefits" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "icon" varchar NOT NULL,
      "title" varchar NOT NULL,
      "copy" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_hero"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_desktop_image_id_media_id_fk" FOREIGN KEY ("desktop_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "homepage_hero_benefits" ADD CONSTRAINT "homepage_hero_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_hero"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "homepage_hero_slides_order_idx" ON "homepage_hero_slides" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "homepage_hero_slides_parent_id_idx" ON "homepage_hero_slides" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "homepage_hero_slides_desktop_image_idx" ON "homepage_hero_slides" USING btree ("desktop_image_id");
    CREATE INDEX IF NOT EXISTS "homepage_hero_slides_mobile_image_idx" ON "homepage_hero_slides" USING btree ("mobile_image_id");
    CREATE INDEX IF NOT EXISTS "homepage_hero_benefits_order_idx" ON "homepage_hero_benefits" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "homepage_hero_benefits_parent_id_idx" ON "homepage_hero_benefits" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "homepage_hero_updated_at_idx" ON "homepage_hero" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "homepage_hero_created_at_idx" ON "homepage_hero" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "homepage_hero_slides" CASCADE;
    DROP TABLE IF EXISTS "homepage_hero_benefits" CASCADE;
    DROP TABLE IF EXISTS "homepage_hero" CASCADE;
  `)
}
