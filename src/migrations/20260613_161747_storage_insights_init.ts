import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_storage_insights_schema_types" AS ENUM('Article', 'FAQPage', 'BreadcrumbList', 'LocalBusiness', 'Service');
  CREATE TYPE "public"."enum_storage_insights_page_type" AS ENUM('pillar', 'cluster');
  CREATE TYPE "public"."enum_storage_insights_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_storage_insights_search_intent" AS ENUM('informational', 'commercial', 'transactional', 'mixed');

  CREATE TABLE IF NOT EXISTS "storage_insights_secondary_keywords" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "keyword" varchar
  );

  CREATE TABLE IF NOT EXISTS "storage_insights_faqs" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "question" varchar NOT NULL,
        "answer" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "storage_insights_internal_links" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "target_page" varchar,
        "anchor_text" varchar
  );

  CREATE TABLE IF NOT EXISTS "storage_insights_schema_types" (
        "order" integer NOT NULL,
        "parent_id" integer NOT NULL,
        "value" "enum_storage_insights_schema_types",
        "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "storage_insights" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "page_type" "enum_storage_insights_page_type" DEFAULT 'pillar' NOT NULL,
        "related_pillar_id" integer,
        "status" "enum_storage_insights_status" DEFAULT 'draft' NOT NULL,
        "published_date" timestamp(3) with time zone,
        "seo_title" varchar NOT NULL,
        "meta_description" varchar NOT NULL,
        "primary_keyword" varchar NOT NULL,
        "search_intent" "enum_storage_insights_search_intent",
        "excerpt" varchar NOT NULL,
        "hero_image_id" integer,
        "content" jsonb NOT NULL,
        "cta_heading" varchar,
        "cta_text" varchar,
        "cta_button_label" varchar DEFAULT 'Get a Storage Quote',
        "cta_button_link" varchar DEFAULT '/quote',
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "storage_insights_id" integer;

  DO $$ BEGIN
   ALTER TABLE "storage_insights_secondary_keywords" ADD CONSTRAINT "storage_insights_secondary_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."storage_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
   ALTER TABLE "storage_insights_faqs" ADD CONSTRAINT "storage_insights_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."storage_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
   ALTER TABLE "storage_insights_internal_links" ADD CONSTRAINT "storage_insights_internal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."storage_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
   ALTER TABLE "storage_insights_schema_types" ADD CONSTRAINT "storage_insights_schema_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."storage_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
   ALTER TABLE "storage_insights" ADD CONSTRAINT "storage_insights_related_pillar_id_storage_insights_id_fk" FOREIGN KEY ("related_pillar_id") REFERENCES "public"."storage_insights"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
   ALTER TABLE "storage_insights" ADD CONSTRAINT "storage_insights_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_storage_insights_fk" FOREIGN KEY ("storage_insights_id") REFERENCES "public"."storage_insights"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  CREATE INDEX IF NOT EXISTS "storage_insights_secondary_keywords_order_idx" ON "storage_insights_secondary_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "storage_insights_secondary_keywords_parent_id_idx" ON "storage_insights_secondary_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "storage_insights_faqs_order_idx" ON "storage_insights_faqs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "storage_insights_faqs_parent_id_idx" ON "storage_insights_faqs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "storage_insights_internal_links_order_idx" ON "storage_insights_internal_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "storage_insights_internal_links_parent_id_idx" ON "storage_insights_internal_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "storage_insights_schema_types_order_idx" ON "storage_insights_schema_types" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "storage_insights_schema_types_parent_idx" ON "storage_insights_schema_types" USING btree ("parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "storage_insights_slug_idx" ON "storage_insights" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "storage_insights_related_pillar_idx" ON "storage_insights" USING btree ("related_pillar_id");
  CREATE INDEX IF NOT EXISTS "storage_insights_hero_image_idx" ON "storage_insights" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "storage_insights_updated_at_idx" ON "storage_insights" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "storage_insights_created_at_idx" ON "storage_insights" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_storage_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("storage_insights_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "storage_insights_secondary_keywords" CASCADE;
  DROP TABLE IF EXISTS "storage_insights_faqs" CASCADE;
  DROP TABLE IF EXISTS "storage_insights_internal_links" CASCADE;
  DROP TABLE IF EXISTS "storage_insights_schema_types" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "storage_insights_id";
  DROP TABLE IF EXISTS "storage_insights" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_storage_insights_schema_types";
  DROP TYPE IF EXISTS "public"."enum_storage_insights_page_type";
  DROP TYPE IF EXISTS "public"."enum_storage_insights_status";
  DROP TYPE IF EXISTS "public"."enum_storage_insights_search_intent";
  `)
}
