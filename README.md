# STOR 24 CMS

Editorial content platform for STOR 24, built on Payload CMS 3.31 and Next.js 15.

## Stack

- Payload CMS 3.31 (admin UI, REST/GraphQL API)
- Next.js 15 / React 19 / TypeScript
- **PostgreSQL** (`@payloadcms/db-postgres`) — the codebase runs on Postgres, not MongoDB
- Local disk media storage (see `docker-compose.yml` for the persistent volume mount)
- Lexical rich text editor
- SEO plugin (`@payloadcms/plugin-seo`) applied to `posts`, `areas` and `storage-units`

## Status

Operational, but scope-overlapping — see `PROJECT_CONTEXT.md` for the full architecture-risk note. In short: this repository also hosts CRM-like collections (`contacts`, `deals`, `activities`) and an inventory/units dashboard that duplicate responsibilities intended for the CRM/operations repository (`stor24-portal`). Do not treat those collections as the authoritative business system without an explicit, documented ownership decision.

## Collections

- `posts` — blog content, draft/published state, SEO metadata
- `faqs` — frequently asked questions
- `areas` — location/area pages with personal and business copy
- `storage-units` — public storage-unit catalogue
- `storage-insights` — pillar/cluster editorial content, FAQs, CTAs
- `media` — image uploads
- `units` — inventory records (overlaps CRM scope — see Status above)
- `contacts`, `deals`, `activities` — CRM-like records (overlaps CRM scope — see Status above)
- `users` — admin authentication

## Local development

```
npm install
cp .env.example .env
npm run dev
```

Runs at http://localhost:4000.

## Environment

See `.env.example` for required variables, including `PAYLOAD_SECRET` and `DATABASE_URI` (a PostgreSQL connection string).

## Deployment

See `INFRASTRUCTURE.md` and `docker-compose.yml` for the production Docker setup.

## Project context

Read `PROJECT_CONTEXT.md` before making architectural changes. It documents the ownership boundary that is still outstanding between this repository, `stor24-portal` (CRM/operations) and `stor24` (public portal), and the priority work needed to resolve the CRM/inventory overlap described above.
