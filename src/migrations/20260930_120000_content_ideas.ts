import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_content_ideas_status" AS ENUM ('idea', 'researching', 'ready', 'writing', 'published', 'parked');
    CREATE TYPE "public"."enum_content_ideas_format" AS ENUM ('guide', 'article', 'faq', 'location');
    CREATE TYPE "public"."enum_content_ideas_priority" AS ENUM ('high', 'normal', 'low');
    CREATE TABLE "content_ideas" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "keyword" varchar,
      "audience" varchar,
      "brief" varchar,
      "research" varchar,
      "published_url" varchar,
      "status" "enum_content_ideas_status" DEFAULT 'idea' NOT NULL,
      "format" "enum_content_ideas_format" DEFAULT 'guide' NOT NULL,
      "priority" "enum_content_ideas_priority" DEFAULT 'normal' NOT NULL,
      "target_date" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX "content_ideas_updated_at_idx" ON "content_ideas" USING btree ("updated_at");
    CREATE INDEX "content_ideas_created_at_idx" ON "content_ideas" USING btree ("created_at");
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "content_ideas_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_ideas_fk" FOREIGN KEY ("content_ideas_id") REFERENCES "public"."content_ideas"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_content_ideas_id_idx" ON "payload_locked_documents_rels" USING btree ("content_ideas_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "content_ideas_id";
    DROP TABLE "content_ideas";
    DROP TYPE "public"."enum_content_ideas_status";
    DROP TYPE "public"."enum_content_ideas_format";
    DROP TYPE "public"."enum_content_ideas_priority";
  `)
}
