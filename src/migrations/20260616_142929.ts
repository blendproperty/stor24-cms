import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_units_location" AS ENUM('sandton', 'randburg', 'midrand', 'centurion', 'roodepoort');
  CREATE TYPE "public"."enum_units_size" AS ENUM('5sqm', '10sqm', '15sqm', '20sqm', '30sqm');
  CREATE TYPE "public"."enum_units_floor" AS ENUM('ground', 'first', 'second');
  CREATE TYPE "public"."enum_units_status" AS ENUM('available', 'occupied', 'reserved', 'maintenance');
  CREATE TABLE IF NOT EXISTS "units" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"unit_number" varchar NOT NULL,
  	"location" "enum_units_location" NOT NULL,
  	"size" "enum_units_size" NOT NULL,
  	"floor" "enum_units_floor",
  	"status" "enum_units_status" DEFAULT 'available' NOT NULL,
  	"monthly_rate" numeric,
  	"tenant_id" integer,
  	"contract_start" timestamp(3) with time zone,
  	"contract_end" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "units_id" integer;
  DO $$ BEGIN
   ALTER TABLE "units" ADD CONSTRAINT "units_tenant_id_contacts_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "units_unit_number_idx" ON "units" USING btree ("unit_number");
  CREATE INDEX IF NOT EXISTS "units_tenant_idx" ON "units" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "units_updated_at_idx" ON "units" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "units_created_at_idx" ON "units" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_units_fk" FOREIGN KEY ("units_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_units_id_idx" ON "payload_locked_documents_rels" USING btree ("units_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "units" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "units" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_units_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_units_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "units_id";
  DROP TYPE "public"."enum_units_location";
  DROP TYPE "public"."enum_units_size";
  DROP TYPE "public"."enum_units_floor";
  DROP TYPE "public"."enum_units_status";`)
}
