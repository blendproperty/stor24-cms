# STOR 24 CMS — Project Context

> Last reviewed: 19 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

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

## Sign-in security hardening — 19 August 2026

Brett requested a security audit of sign-in/auth across all three repositories. This repository had the most serious finding of the three:

**CRITICAL — fixed in code, needs manual action from Brett to fully close:** `docker-compose.yml` had the live production `PAYLOAD_SECRET` (signs CMS admin session/JWT tokens) and the production database password (`postgresql://stor4_user:stor4_pass@stor4_db:5432/stor4_db`) committed in plaintext to git — despite `.gitignore` listing this exact file, meaning it was force-added at some point (`git add -f`). Anyone with read access to this repository could have forged valid CMS admin sessions or connected directly to the production database.

Fixed: `docker-compose.yml` now reads both values via `${PAYLOAD_SECRET}` / `${DATABASE_URI}` variable substitution from a `.env` file on the VPS (that `.env` file is separately, correctly gitignored and was never committed). The file itself no longer contains a secret to leak on future commits.

**Still required, and only Brett can do this (no VPS/DB access from this environment):**
1. Rotate `PAYLOAD_SECRET` on the VPS to a new random value (a fresh one was generated during this session — see chat) and set it in `/opt/stor24-cms/.env` (or wherever this repo's `.env` lives on the server) as `PAYLOAD_SECRET=<new value>`.
2. Change the production Postgres password for `stor4_user` and update `DATABASE_URI` in the same `.env` file to match.
3. Rotating `PAYLOAD_SECRET` invalidates all existing admin sessions and API keys — everyone will need to log in again, and any stored API key integrations will need regenerating.
4. Ideally, purge the old secret/password from git history (not just the latest commit) since they were exposed for however long this file was public — a `git filter-repo` or BFG pass on this repository, done by Brett or someone with full git tooling access, since it requires a force-push and coordination with anyone else who has a local clone.

**Also fixed — orphaned CRM collection files removed:** `src/collections/Contacts.ts`, `Deals.ts`, `Activities.ts` were still sitting in the repo (not imported into `payload.config.ts`, so inert today) with no `access` block defined at all — Payload defaults to fully public read/write when `access` is omitted. If anyone had re-imported one of these without adding explicit access rules, it would have silently recreated the exact public-write CRM hole that was closed on 18 August. Deleted outright rather than patched, since they served no purpose once the CRM collections were removed. `src/collections/Users.ts` (also unused — the live `users` config is inline in `payload.config.ts`, not this file) was deleted too, since it lacked the lockout/token-expiry settings the live config has and was a trap if ever swapped in.

**Also fixed — security headers:** `next.config.mjs` now sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and HSTS. **CSP was deliberately not added here** (unlike `stor24-portal` and `stor24`) — Payload's admin UI relies on inline styles/scripts and dynamically injected chunks that a strict CSP would break without careful per-directive tuning specific to Payload's admin bundle. Tracked as a follow-up, not skipped permanently.

**Not fixed — needs a dedicated follow-up:**
- No 2FA/MFA on CMS admin login (or the CRM's staff login in `stor24-portal`) — password-only currently.
- `useAPIKey: true` is set on the live `users` collection, giving a second credential path alongside password login — worth confirming any issued API keys are scoped appropriately and get rotated alongside the secret above.

## Current verified implementation

- Payload admin and API routes are present.
- PostgreSQL adapter, Lexical rich text, SEO plugin and local media storage are configured in the codebase.
- **Collections are now editorial-only: `users`, `media`, `storage-insights`, `posts`, `faqs`, `areas`.** `contacts`, `deals`, `activities` and `units` were removed 18 August 2026 (see "CRM-collection removal" below); `storage-units` was removed 19 August 2026 (see "storage-units removal" below) after confirming the live marketing site never reads it. The dead `Contacts.ts`/`Deals.ts`/`Activities.ts`/`Users.ts` files (never imported, but present with no access control) were also deleted 19 August 2026 as part of the security hardening above.
- Migration files exist for storage insights, the (now-retired) inventory/deal changes, the 18 August 2026 CRM-collection removal, and the 19 August 2026 storage-units removal.
- Public frontend routes are also present under `src/app/(frontend)`.
- README.md corrected 17 August 2026 to reflect PostgreSQL (not MongoDB/localDisk) and document the real collection list — **README's collection list is stale (still lists `contacts`/`deals`/`activities`/`units`/`storage-units`) and should be refreshed to match this file** (see Priority next work).
- Admin panel now uses real STOR 24 CI (see "Admin CI theme fix" below), not the ad-hoc dark-navy placeholder theme it shipped with.
- `docker-compose.yml` no longer contains a live secret or DB password — both now come from a gitignored `.env` on the VPS (see "Sign-in security hardening" above). **Rotation of the previously-exposed values is still outstanding and requires Brett's action on the VPS.**

## Deploy pipeline root cause fixed — 19 August 2026

Brett reported that changes pushed to `main` were not appearing on the live CMS. Diagnosis (via direct GitHub Actions log inspection and VPS terminal output Brett ran) found three stacked issues, all now fixed:

1. **GitHub Actions was disabled at the repository-settings level.** No API/MCP tool can toggle this — Brett enabled it himself in the GitHub UI. `workflow_dispatch: {}` was also added to `.github/workflows/deploy.yml` as a manual-trigger fallback alongside the existing `push: branches: [main]` trigger.
2. **The VPS's git remote was wrong.** `/opt/stor24-cms`'s `origin` pointed at `https://github.com/doveydragon/stor24-cms.git` — an unrelated account/repo — instead of `https://github.com/blendproperty/stor24-cms.git`. Every deploy was pulling from (and reporting "Already up to date" against) the wrong repository. Brett fixed this manually on the VPS (`git remote set-url origin https://github.com/blendproperty/stor24-cms.git`, `git fetch`, `git reset --hard origin/main`) and confirmed the correct commit then deployed.
3. **`src/app/(payload)/admin/importMap.js` (generated-but-committed) still referenced the deleted Dashboard components** from the 18 August CRM removal, breaking the Docker build with `Module not found` errors. Fixed by hand-editing the file to remove the six stale import/export entries while preserving the legitimate Payload/plugin ones.

`.github/workflows/deploy.yml` was also fixed to actually run migrations on deploy — previously the pipeline built and restarted the container but never ran `payload migrate`; it now runs `docker compose exec -T stor24-cms npx payload migrate` after `docker compose up -d --build`.

A full rebuild/redeploy after these fixes completed successfully and the 18 August CRM-removal migration ran live against production (`Migrating: 20260818_120000_remove_crm_collections` → `Migrated ... (182ms)`), confirming this pipeline now works end-to-end.

**Working rule going forward:** whenever a component file referenced by `importMap.js` is deleted, update `importMap.js` in the same commit — Payload does not regenerate it automatically on file deletion, only via `payload generate:importmap`, which nothing in this repo's pipeline runs.

## Admin CI theme fix — 19 August 2026

Brett flagged (with screenshots) that the CMS admin panel was hard to read — a dark-navy (`#1a1a2e`) sidebar/header theme with low-contrast text, unrelated to STOR 24's actual brand.

**Root cause of one wasted attempt:** initially tried wiring a stylesheet via `admin: { css: ... }` in `payload.config.ts` — this is not a real Payload 3.31 `AdminConfig` field and broke the TypeScript build (`Object literal may only specify known properties, and 'css' does not exist in type...`). Reverted. The correct, Payload-native mechanism is `src/app/(payload)/custom.scss`, which the auto-generated `layout.tsx` already imports — this also explains why the admin had *some* custom theme (the old dark-navy one) before this session.

**Fix, applied in `custom.scss`:** real Stor24 CI mapped onto Payload's theme custom properties — `--theme-bg: #f5f3ea` (cream), `--theme-text: #071411` (ink), a full `--theme-elevation-0` through `-1000` ramp from white/cream to ink, `--theme-success-500: #079447`, `--theme-warning-500: #ff7a00`, `--theme-error-500: #d1352b`; body font set to Satoshi with system fallbacks; sidebar (`.nav`, `.nav__wrap`, `.app-header`) now ink (`#071411`) instead of navy; active nav link uses translucent orange (`rgba(255,90,10,0.18)`) background with `#ff7a00` label; primary buttons use `#ff5a0a`.

Also replaced `src/components/Logo.tsx` and `src/components/Icon.tsx`, which were placeholder Tailwind-orange (`#f97316`) text — now use the real orange (`#ff5a0a`) badge + ink wordmark.

**Not yet visually confirmed live** — pushed but Brett has not yet redeployed/screenshotted the result since this fix went in. Confirm on next deploy.

## storage-units removal — 19 August 2026

Brett questioned why "Storage Units" still appeared in the CMS admin, believing pricing/unit data belonged in the CRM. Checked directly (code search across the live `stor24` marketing-site repository): zero references to `storage-units`/`storageUnits`/any CMS pricing endpoint exist there. The real, live data source for unit pricing, dimensions, features and availability is `stor24` → `app/lib/portal.ts` → `getPublicFacilities()` → `stor24-portal`'s public API (`/api/public/v1/facilities`), which already carries real per-unit data (`monthlyRateZar`, dimensions, features, availability). A code comment already present in `portal.ts` documents a prior, already-reverted mistake of writing this kind of data into the CMS instead of the CRM — the same anti-pattern flagged again here. Brett was right: `storage-units` was dead, duplicate data.

**Removed:** the `storage-units` collection definition from `src/payload.config.ts` and its entry in `seoPlugin({ collections: [...] })`. New migration `src/migrations/20260819_054800_remove_storage_units.ts` (registered in `src/migrations/index.ts`) drops the `storage_units` and `storage_units_features` tables and the `payload_locked_documents_rels.storage_units_id` join column, `CASCADE`. `down()` is intentionally a no-op, following the same pattern and rationale as the 18 August CRM-collection-removal migration.

**Not yet confirmed live** — pushed; needs a redeploy (which will also run this migration via the now-fixed deploy pipeline) before treating it as done in production.

## CRM-collection removal — 18 August 2026

**Instruction (Brett Dovey):** "any CRM type functionality should be removed from [stor24-cms] and added to the portal. Does not make sense to have this duplication."

This repository had accumulated a full parallel CRM: four Payload collections (`contacts`, `deals`, `activities`, `units`) plus five custom admin dashboard views built on top of them (`Dashboard` — the main CRM pipeline view with stats, a 7-day leads chart and a deals-stage kanban; `Performance`/`PowerDashboard`; `Inventory`/`InventoryDashboard`; `InventoryOps`; `ContactDetail`). `contacts` and `deals` even had public (`create: () => true`) write access, meaning anyone could have written into this shadow CRM without authentication. This was flagged as an architectural risk in this file's "Status warning" as far back as 17 August 2026, and directly caused a real mistake the next day — a quote-lead-capture feature was briefly wired to write into `contacts`/`deals` here instead of into the real CRM (`stor24-portal`), caught and reverted the same day (see `stor24-portal/PROJECT_CONTEXT.md` "Public leads API" entry). Brett's instruction above settled it: remove the duplication outright, not just flag it.

**What was removed, same day:**

- `src/payload.config.ts` — deleted the `units`, `contacts`, `deals` and `activities` collection definitions; removed the `views` block (`Dashboard`, `Performance`, `Inventory`, `InventoryOps`, `ContactDetail`) and the `afterNavLinks` CRM nav from `admin.components`. Admin now only exposes the editorial collections plus the standard Payload UI — no custom CRM screens.
- Deleted six component files: `src/components/Dashboard/index.tsx`, `Nav.tsx`, `ContactDetail/index.tsx`, `InventoryDashboard/index.tsx`, `InventoryOps/index.tsx`, `PowerDashboard/index.tsx` — all of them called `/api/contacts`, `/api/deals` or rendered unit/inventory data with no remaining reason to exist once those collections were gone.
- `src/migrations/20260818_120000_remove_crm_collections.ts` (registered in `src/migrations/index.ts`) — drops the `units`, `activities`, `deals` and `contacts` tables (`CASCADE`, so dependent foreign keys and the `payload_locked_documents_rels` join columns go with them), plus their associated Postgres enum types. The `down()` migration is deliberately a no-op with an explanatory comment: this is treated as an intentional, irreversible cleanup, not a reversible schema tweak — if it ever needs undoing, that should come from a pre-migration database backup, not a generated down-migration guessing at old data.
- **Confirmed live 19 August 2026** — this migration ran successfully in production as part of the deploy-pipeline fix above (`Migrating: 20260818_120000_remove_crm_collections` → `Migrated ... (182ms)`), and the CMS admin was directly inspected (browser) showing `Deals`, `Units` and the CRM dashboard nav are gone.
- **Follow-up 19 August 2026:** the four collection *files* themselves (`Contacts.ts`, `Deals.ts`, `Activities.ts`, plus unused `Users.ts`) were still present in `src/collections/` despite not being imported — deleted during the sign-in security hardening pass above, since they had no access control and were a landmine if ever re-imported.

**Where the functionality now actually lives:** it doesn't need to be rebuilt — `stor24-portal` already has a materially more complete version of everything these collections were approximating (real `Customer`/`Lead`/`Deal`-equivalent records via `Tenancy`/`Occupancy`/`Reservation`, a public leads API, a full reservation-to-lease-to-billing lifecycle, staff dashboards). Nothing needs to be migrated across; this was pure duplication, not a feature gap.

## Status warning

**Largely resolved.** The CRM/CMS overlap flagged below since 17 August 2026 has been removed from the codebase and confirmed live (see above), the dead `storage-units` collection was also removed 19 August 2026 (pending redeploy confirmation), and the orphaned collection files with no access control were deleted the same day. What's left: (1) confirm the storage-units removal migration has run in production after the next redeploy; (2) rotate the previously-leaked `PAYLOAD_SECRET`/DB password on the VPS (see "Sign-in security hardening" above) — this is outstanding and only Brett can do it; (3) the duplicated public `(frontend)` application under `src/app/(frontend)` is a separate, still-open overlap risk (with the `stor24` repository) — not addressed by this change and still tracked in Priority next work.

No production-readiness claim should be made from the presence of collections or dashboards alone. Authentication/roles, data ownership, publication workflow, portal consumption, migrations, backups, media strategy and deployed behaviour require current verification.

## Ownership decision — APPROVED 17 August 2026, enforced in code 18–19 August 2026

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

**This boundary is now enforced in this repository's schema, not just documented.** `contacts`, `deals`, `activities`, `units` and their dashboards were removed 18 August 2026; `storage-units` (per-unit pricing/size data, also CRM-shaped) was removed 19 August 2026 once confirmed unused by the live site. The one remaining overlap against this boundary is the duplicated `(frontend)` public-site tree, which is a separate decision (see Priority next work item 1).

## Cross-repository contract

- Publish structured, versioned, sanitised content for the public portal.
- Do not expose draft content, internal notes, customer data, provider credentials or operational audit records publicly.
- Avoid duplicating the public portal application inside the CMS. Decide whether the existing `(frontend)` tree will be retired, used only for preview, or become the sole renderer before extending it.
- Coordinate content schema changes with the portal and operational references with the CRM.
- **Never add customer/lead/deal/contact/unit/pricing-shaped collections back to this repository.** If a reporting need comes up that looks CRM-shaped, it belongs in `stor24-portal` (which already has the real data) — this repository should consume it via API/read-only reference if a display is ever needed here, never own it.

## Priority next work

1. **Rotate the previously-leaked `PAYLOAD_SECRET` and database password on the VPS** — highest priority, only Brett can do this (see "Sign-in security hardening" above for exact steps).
2. Decide the future of the duplicated `(frontend)` application (separate overlap from the now-removed CRM collections, still open).
3. Define draft, review, approval, publish, schedule, unpublish and rollback workflows with roles and audit evidence.
4. Define the portal delivery mechanism: Payload REST/GraphQL, cache/revalidation strategy, preview and failure behaviour.
5. Verify backups, media storage, access controls and validation before production use (migrations and the deploy pipeline are now verified working, see above).
6. Confirm the 19 August 2026 storage-units-removal migration (`20260819_054800_remove_storage_units`) has run against production on the next redeploy, and visually confirm the admin CI theme fix (`custom.scss`) renders correctly live.
7. Refresh `README.md`'s collection list, which still documents the pre-removal state (`contacts`/`deals`/`activities`/`units`/`storage-units` included) and needs to be brought back in line with the current, editorial-only collection list in this file.
8. Add a properly-tuned CSP for the Payload admin bundle (deliberately skipped in the 19 August 2026 headers pass — see "Sign-in security hardening").
9. Consider 2FA/MFA for CMS admin accounts alongside the same work in `stor24-portal`.

## Working rules for any AI assistant

1. Inspect branch, status, recent commits, Payload config, collections and migrations before changing or reporting status.
2. Do not assume a collection is the authoritative business system merely because it exists.
3. Never deploy, migrate production data, delete collections or move domain ownership without explicit approval. **(18–19 August 2026 removals were explicit, direct instructions from Brett — not inferences.)**
4. Preserve published URLs, slugs and SEO metadata unless the requested change explicitly covers them.
5. Keep secrets and customer information out of source control, logs, prompts and public API responses. **This was violated once already (`docker-compose.yml`, fixed 19 August 2026) — before committing any file with `environment:`/`env:`/connection-string-shaped content, check whether it should instead reference a gitignored `.env` file.**
6. Generate Payload types/import maps after schema changes and include the required migration. **`importMap.js` is committed but not auto-regenerated on component deletion — update it by hand in the same commit when a referenced component file is removed, or the Next.js build breaks (see "Deploy pipeline root cause fixed").**
7. Run proportionate lint, type and build validation; distinguish baseline failures from introduced failures.
8. Use the official STOR 24 CI and keep public-facing copy direct and non-technical. **Admin panel theming goes through `src/app/(payload)/custom.scss` (imported by the generated `layout.tsx`) — there is no `admin.css` config field in Payload 3.31.**
9. Update this file after a material decision or implementation change.
10. Follow the branching policy above: short-lived branches only, deleted promptly after merge.
11. **When removing a collection, also remove everything built on top of it in the same pass — dashboards, admin views, nav links, importMap entries, seoPlugin references, and any dead collection-definition files left behind — not just the live schema reference.** On 18 August 2026 the schema was cleaned up but the orphaned `Contacts.ts`/`Deals.ts`/`Activities.ts` files were missed and had to be deleted separately on 19 August once flagged as a security risk.
12. **Destructive schema migrations (dropping tables) should have an intentionally no-op, explained `down()` rather than a fabricated reversal.** A generated "undo" for a table drop can't actually restore the data that was in it; say so in the migration rather than writing misleading rollback code.
13. **If deploys stop reflecting pushed changes, check the whole chain before assuming the workflow file is wrong:** GitHub Actions enabled at the repo-settings level, the VPS's git remote actually pointing at this repository, and only then the build/workflow logic itself.
14. **A Payload collection with no `access` block defined defaults to public read/write.** Any collection file in this repo — even one not currently imported into `payload.config.ts` — should either have an explicit `access` block or not exist at all. Don't leave "just in case" collection files around.

## Definition of done

A CMS capability is complete only when ownership is approved, the schema and permissions enforce it, editorial workflow is usable, portal delivery is compatible, migrations and recovery are covered, and the deployed publish/preview experience is verified.
