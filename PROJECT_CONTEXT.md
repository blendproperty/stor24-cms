# STOR 24 CMS — Project Context

> Last reviewed: 17 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

## Product identity and boundary

This is the **STOR 24** content-management repository. It is not SiteLink and must use STOR 24 terminology and official CI. The public brand reference is <https://stor4.srv938083.hstgr.cloud/>: ink `#071411`, cream `#F5F3EA`, orange `#FF5A0A`, Satoshi typography and the official outlined logo.

## Repository role

The CMS owns editorial content and media that authorised users publish to STOR 24 customer channels. It must not become a second CRM, inventory system, booking engine, payment ledger or finance system of record.

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
- Collections include users, media, storage insights, contacts, deals, activities and units/inventory-related structures.
- Custom dashboard components include inventory, operations, contact and power-dashboard views.
- Migration files exist for storage insights and inventory/deal changes.
- Public frontend routes are also present under `src/app/(frontend)`.
- Local repository was clean on `main` when this context was created; the latest visible commit was `0a81a1d` for the inventory operations dashboard, units collection and deal-to-unit link.
- README.md corrected 17 August 2026 to reflect PostgreSQL (not MongoDB/localDisk) and document the real collection list.

## Status warning

This repository currently mixes CMS/editorial concerns with CRM-like contacts, deals, activities, units, inventory dashboards and a duplicated public frontend. That overlap is an architectural risk, not confirmation that the CMS owns those domains. The ownership decision below is now approved; the overlap itself is not yet resolved — see Priority next work.

No production-readiness claim should be made from the presence of collections or dashboards alone. Authentication/roles, data ownership, publication workflow, portal consumption, migrations, backups, media strategy and deployed behaviour require current verification.

## Ownership decision — APPROVED 17 August 2026

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

Approving this boundary does not by itself resolve the existing overlap: `contacts`, `deals`, `activities`, `units` and inventory dashboards remain live in this repository's schema today and must not be treated as authoritative CRM data. Bringing the codebase in line with the approved boundary (retire, convert to read-only CRM references, or migrate) is tracked as the next priority item below.

## Cross-repository contract

- Publish structured, versioned, sanitised content for the public portal.
- Do not expose draft content, internal notes, customer data, provider credentials or operational audit records publicly.
- Avoid duplicating the public portal application inside the CMS. Decide whether the existing `(frontend)` tree will be retired, used only for preview, or become the sole renderer before extending it.
- Coordinate content schema changes with the portal and operational references with the CRM.

## Priority next work

1. Bring the codebase in line with the approved boundary above: retire or convert `contacts`, `deals`, `activities`, `units` and inventory dashboards to read-only CRM references (or migrate them to `stor24-portal` outright).
2. Decide the future of the duplicated `(frontend)` application.
3. Define draft, review, approval, publish, schedule, unpublish and rollback workflows with roles and audit evidence.
4. Define the portal delivery mechanism: Payload REST/GraphQL, cache/revalidation strategy, preview and failure behaviour.
5. Verify migrations, backups, media storage, access controls, validation, deployment and recovery before production use.

## Working rules for any AI assistant

1. Inspect branch, status, recent commits, Payload config, collections and migrations before changing or reporting status.
2. Do not assume a collection is the authoritative business system merely because it exists.
3. Never deploy, migrate production data, delete collections or move domain ownership without explicit approval.
4. Preserve published URLs, slugs and SEO metadata unless the requested change explicitly covers them.
5. Keep secrets and customer information out of source control, logs, prompts and public API responses.
6. Generate Payload types/import maps after schema changes and include the required migration.
7. Run proportionate lint, type and build validation; distinguish baseline failures from introduced failures.
8. Use the official STOR 24 CI and keep public-facing copy direct and non-technical.
9. Update this file after a material decision or implementation change.
10. Follow the branching policy above: short-lived branches only, deleted promptly after merge.

## Definition of done

A CMS capability is complete only when ownership is approved, the schema and permissions enforce it, editorial workflow is usable, portal delivery is compatible, migrations and recovery are covered, and the deployed publish/preview experience is verified.
