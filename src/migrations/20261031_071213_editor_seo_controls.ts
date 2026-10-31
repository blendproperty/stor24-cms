import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

// Generated against an isolated current-config snapshot; only new editor tables/lock relations.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN CREATE TYPE "public"."enum_page_seo_path" AS ENUM('/', '/micro-warehousing', '/personal-storage', '/business-storage', '/student-storage', '/moving-storage', '/storage-unit-sizes', '/space-guide', '/storage/midpoint', '/storage/melrose', '/contact', '/faq', '/blog', '/storage-insights', '/terms', '/privacy', '/paia', '/micro-warehousing/midpoint'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_page_seo_canonical_path" AS ENUM('/', '/micro-warehousing', '/personal-storage', '/business-storage', '/student-storage', '/moving-storage', '/storage-unit-sizes', '/space-guide', '/storage/midpoint', '/storage/melrose', '/contact', '/faq', '/blog', '/storage-insights', '/terms', '/privacy', '/paia', '/micro-warehousing/midpoint'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_page_seo_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_redirects_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "page_seo" (
    "id" serial PRIMARY KEY NOT NULL,
    "path" "enum_page_seo_path" NOT NULL,
    "seo_title" varchar,
    "meta_description" varchar,
    "canonical_path" "enum_page_seo_canonical_path",
    "no_index" boolean DEFAULT false,
    "og_title" varchar,
    "og_description" varchar,
    "social_image_id" integer,
    "status" "enum_page_seo_status" DEFAULT 'draft' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "redirects" (
    "id" serial PRIMARY KEY NOT NULL,
    "source" varchar NOT NULL,
    "destination" varchar NOT NULL,
    "status_code" numeric DEFAULT 308 NOT NULL,
    "status" "enum_redirects_status" DEFAULT 'draft' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "page_seo_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "redirects_id" integer;
  DO $$ BEGIN ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_social_image_id_media_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE UNIQUE INDEX IF NOT EXISTS "page_seo_path_idx" ON "page_seo" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "page_seo_social_image_idx" ON "page_seo" USING btree ("social_image_id");
  CREATE INDEX IF NOT EXISTS "page_seo_updated_at_idx" ON "page_seo" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "page_seo_created_at_idx" ON "page_seo" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "redirects_source_idx" ON "redirects" USING btree ("source");
  CREATE INDEX IF NOT EXISTS "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_seo_fk" FOREIGN KEY ("page_seo_id") REFERENCES "public"."page_seo"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_page_seo_id_idx" ON "payload_locked_documents_rels" USING btree ("page_seo_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  DO $$ BEGIN ALTER TABLE "redirects" ADD CONSTRAINT "redirects_supported_status" CHECK (status_code IN (301,302,307,308)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "redirects" ADD CONSTRAINT "redirects_not_self" CHECK (source <> destination); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_exclusion_canonical" CHECK (NOT coalesce(no_index,false) OR canonical_path IS NULL OR canonical_path::text = path::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Roll back the application image while retaining page SEO and redirect records; do not delete live editorial data.')
}
