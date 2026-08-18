import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "units" CASCADE;
  DROP TABLE IF EXISTS "activities" CASCADE;
  DROP TABLE IF EXISTS "deals" CASCADE;
  DROP TABLE IF EXISTS "contacts" CASCADE;

  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "units_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "contacts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "deals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "activities_id";

  DROP TYPE IF EXISTS "public"."enum_units_location";
  DROP TYPE IF EXISTS "public"."enum_units_size";
  DROP TYPE IF EXISTS "public"."enum_units_floor";
  DROP TYPE IF EXISTS "public"."enum_units_status";
  DROP TYPE IF EXISTS "public"."enum_contacts_source";
  DROP TYPE IF EXISTS "public"."enum_contacts_unit_size";
  DROP TYPE IF EXISTS "public"."enum_contacts_status";
  DROP TYPE IF EXISTS "public"."enum_deals_stage";
  DROP TYPE IF EXISTS "public"."enum_deals_unit_size";
  DROP TYPE IF EXISTS "public"."enum_activities_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Intentionally irreversible: contacts, deals, activities and units were CRM-shaped
  // collections that duplicated the real CRM in stor24-portal (see PROJECT_CONTEXT.md,
  // "Ownership decision"). Any data in them predates this cleanup and is not restored here.
  // If this needs to be rolled back, restore from the pre-migration database backup instead.
}
