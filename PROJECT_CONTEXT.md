# STOR 24 CMS — Project Context

> Last reviewed: 18 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

## Product identity and boundary

This is the **STOR 24** content-management repository. It is not SiteLink and must use STOR 24 terminology and official CI. The public brand reference is <https://stor4.srv938083.hstgr.cloud/>: ink `#071411`, cream `#F5F3EA`, orange `#FF5A0A`, Satoshi typography and the official outlined logo.

## Repository role

The CMS owns editorial content and media that authorised users publish to STOR 24 customer channels. **As of 18 August 2026 this is enforced in code, not just policy** — it is not, and no longer contains the code for, a second CRM, inventory system, booking engine, payment ledger or finance system of record.

- Repository: `blendproperty/stor24-cms`
- Primary branch: `main`
- Stack: Payload CMS 3.31, Next.js 15, React 19, TypeScript and PostgreSQL
- Payload configuration: `src/payload.config.ts`
- Generated types: `src/payload-types.ts`

## Branching policy

Branches exist only as short-lived rollback/review points before merging into `main`. Open a branch, get it reviewed and merged, then delete it immediately — do not let feature branches accumulate. This repository had only `main` as of the 17 August 2026 audit (no stale branches to clean up here), unlike `stor24` and `stor24-portal`; keep it that way.

## Current verified implementation

- Payload admin and API routes are present.
- PostgreSQL adapter, Lexical rich text, SEO plugin and local media storage are configured in the codebase.
- **Collections are now editorial-only: `users`, `media`, `storage-insights`, `storage-units`, `posts`, `faqs`, `areas`.** `contacts`, `deals`, `activities` and `units` were removed 18 August 2026 — see "CRM-collection removal" below.
- Migration files exist for storage insights, the (now-retired) inventory/deal changes, and the 18 August 2026 removal migration.
- Public frontend routes are also present under `src/app/(frontend)`.
- README.md corrected 17 August 2026 to reflect PostgreSQL (not MongoDB/localDisk) and document the real collection list — **README's collection list is now stale again post-removal and should be refreshed to match this file** (see Priority next work).

## CRM-collection removal — 18 August 2026

**Instruction (Brett Dovey):** "any CRM type functionality should be removed from [stor24-cms] and added to the portal. Does not make sense to have this duplication."

This repository had accumulated a full parallel CRM: four Payload collections (`contacts`, `deals`, `activities`, `units`) plus five custom admin dashboard views built on top of them (`Dashboard` — the main CRM pipeline view with stats, a 7-day leads chart and a deals-stage kanban; `Performance`/`PowerDashboard`; `Inventory`/`InventoryDashboard`; `InventoryOps`; `ContactDetail`). `contacts` and `deals` even had public (`create: () => true`) write access, meaning anyone could have written into this shadow CRM without authentication. This was flagged as an architectural risk in this file's "Status warning" as far back as 17 August 2026, and directly caused a real mistake the next day — a quote-lead-capture feature was briefly wired to write into `contacts`/`deals` here instead of into the real CRM (`stor24-portal`), caught and reverted the same day (see `stor24-portal/PROJECT_CONTEXT.md` "Public leads API" entry). Brett's instruction above settled it: remove the duplication outright, not just flag it.

**What was removed, same day:**

- `src/payload.config.ts` — deleted the `units`, `contacts`, `deals` and `activities` collection definitions; removed the `views` block (`Dashboard`, `Performance`, `Inventory`, `InventoryOps`, `ContactDetail`) and the `afterNavLinks` CRM nav from `admin.components`. Admin now only exposes the editorial collections plus the standard Payload UI — no custom CRM screens.
- Deleted six component files: `src/components/Dashboard/index.tsx`, `Nav.tsx`, `ContactDetail/index.tsx`, `InventoryDashboard/index.tsx`, `InventoryOps/index.tsx`, `PowerDashboard/index.tsx` — all of them called `/api/contacts`, `/api/deals` or rendered unit/inventory data with no remaining reason to exist once those collections were gone.
- `src/migrations/20260818_120000_remove_crm_collections.ts` (new, registered in `src/migrations/index.ts`) — drops the `units`, `activities`, `deals` and `contacts` tables (`CASCADE`, so dependent foreign keys and the `payload_locked_documents_rels` join columns go with them), plus their associated Postgres enum types. The `down()` migration is deliberately a no-op with an explanatory comment: this is treated as an intentional, irreversible cleanup, not a reversible schema tweak — if it ever needs undoing, that should come from a pre-migration database backup, not a generated down-migration guessing at old data.
- **Not yet confirmed: whether this migration has actually run against production.** Per this repository's deploy process, migrations run via whatever CI/CD or manual `payload migrate` step this repo uses on deploy — that has not been checked yet for this repository specifically (unlike `stor24-portal`, which has a documented, verified-automatic `deploy-vps.yml`). Confirm the migration ran (and that the `units`/`contacts`/`deals`/`activities` tables are actually gone from the production database) before treating this as fully live.

**Where the functionality now actually lives:** it doesn't need to be rebuilt — `stor24-portal` already has a materially more complete version of everything these collections were approximating (real `Customer`/`Lead`/`Deal`-equivalent records via `Tenancy`/`Occupancy`/`Reservation`, a public leads API, a full reservation-to-lease-to-billing lifecycle, staff dashboards). Nothing needs to be migrated across; this was pure duplication, not a feature gap.

## Status warning

**Largely resolved 18 August 2026.** The CRM/CMS overlap flagged below since 17 August 2026 has been removed from the codebase (see above). What's left of this warning: (1) confirm the removal migration has actually run in production, not just been pushed to `main`; (2) the duplicated public `(frontend)` application under `src/app/(frontend)` is a separate, still-open overlap risk (with the `stor24` repository) — not addressed by this change and still tracked in Priority next work.

No production-readiness claim should be made from the presence of collections or dashboards alone. Authentication/roles, data ownership, publication workflow, portal consumption, migrations, backups, media strategy and deployed behaviour require current verification.

## Ownership decision — APPROVED 17 August 2026, enforced in code 18 August 2026

**Approved by:** Brett Dovey, Blend Property Group.

The boundary below is the confirmed architecture decision across all three STOR 24 repositories, not a recommendation:

```text
CMS owns
  editorial pages, storage insights, FAQs, campaign content,
  SEO fields, approved media and publication state

CRM owns
  people, leads, deals/reservations, facilities, units, availability,
  leases, tasks, operations, audit and integration state

Public portal owns
  customer presentation, browsing, quote and booking experience

MRI Property Central (proposed system of record, approved boundary —
detailed mapping still open, see stor24-portal PROJECT_CONTEXT.md)
  debtor accounting, general ledger, VAT, financial controls,
  statutory reporting
```

**This boundary is now enforced in this repository's schema, not just documented.** `contacts`, `deals`, `activities`, `units` and their dashboards were removed from `src/payload.config.ts` and the codebase on 18 August 2026 (see "CRM-collection removal" above). The one remaining overlap against this boundary is the duplicated `(frontend)` public-site tree, which is a separate decision (see Priority next work item 1).

## Cross-repository contract

- Publish structured, versioned, sanitised content for the public portal.
- Do not expose draft content, internal notes, customer data, provider credentials or operational audit records publicly.
- Avoid duplicating the public portal application inside the CMS. Decide whether the existing `(frontend)` tree will be retired, used only for preview, or become the sole renderer before extending it.
- Coordinate content schema changes with the portal and operational references with the CRM.
- **Never add customer/lead/deal/contact-shaped collections back to this repository.** If a reporting need comes up that looks CRM-shaped, it belongs in `stor24-portal` (which already has the real data) — this repository should consume it via API/read-only reference if a display is ever needed here, never own it.

## Priority next work

1. Decide the future of the duplicated `(frontend)` application (separate overlap from the now-removed CRM collections, still open).
2. Define draft, review, approval, publish, schedule, unpublish and rollback workflows with roles and audit evidence.
3. Define the portal delivery mechanism: Payload REST/GraphQL, cache/revalidation strategy, preview and failure behaviour.
4. Verify migrations, backups, media storage, access controls, validation, deployment and recovery before production use.
5. Confirm the 18 August 2026 CRM-collection-removal migration (`20260818_120000_remove_crm_collections`) has actually run against the production database, not just been pushed to `main` — check this repository's deploy process (CI/CD or manual) the same way `stor24-portal`'s `deploy-vps.yml` was checked.
6. Refresh `README.md`'s collection list, which now documents the pre-removal (`contacts`/`deals`/`activities`/`units` included) state and needs to be brought back in line with the current, editorial-only collection list in this file.

## Working rules for any AI assistant

1. Inspect branch, status, recent commits, Payload config, collections and migrations before changing or reporting status.
2. Do not assume a collection is the authoritative business system merely because it exists.
3. Never deploy, migrate production data, delete collections or move domain ownership without explicit approval. **(18 August 2026 removal was explicit, direct instruction from Brett — "any CRM type functionality should be removed from here... does not make sense to have this duplication" — not an inference.)**
4. Preserve published URLs, slugs and SEO metadata unless the requested change explicitly covers them.
5. Keep secrets and customer information out of source control, logs, prompts and public API responses.
6. Generate Payload types/import maps after schema changes and include the required migration.
7. Run proportionate lint, type and build validation; distinguish baseline failures from introduced failures.
8. Use the official STOR 24 CI and keep public-facing copy direct and non-technical.
9. Update this file after a material decision or implementation change.
10. Follow the branching policy above: short-lived branches only, deleted promptly after merge.
11. **When removing a collection, also remove everything built on top of it in the same pass — dashboards, admin views, nav links — not just the schema.** On 18 August 2026, removing `contacts`/`deals`/`activities`/`units` required also deleting six dependent component files (`Dashboard`, `Nav`, `ContactDetail`, `InventoryDashboard`, `InventoryOps`, `PowerDashboard`) that all called the now-gone collections' APIs; leaving them in place would have shipped broken admin screens.
12. **Destructive schema migrations (dropping tables) should have an intentionally no-op, explained `down()` rather than a fabricated reversal.** A generated "undo" for a table drop can't actually restore the data that was in it; say so in the migration rather than writing misleading rollback code.

## Definition of done

A CMS capability is complete only when ownership is approved, the schema and permissions enforce it, editorial workflow is usable, portal delivery is compatible, migrations and recovery are covered, and the deployed publish/preview experience is verified.
