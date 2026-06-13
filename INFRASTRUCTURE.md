# Stor24 CMS — Infrastructure Reference

This document describes how the Stor24 CMS (Payload CMS + custom CRM) is deployed, configured, and connected to other services. Use this as the starting point for any server migration, troubleshooting, or onboarding a new developer.

## Overview

| Item | Value |
|---|---|
| Repo | `github.com/doveydragon/stor24-cms` (branch: `main`) |
| Framework | Payload CMS 3.x + Next.js, Postgres adapter |
| Container name | `stor24-cms` |
| VPS path | `/opt/stor24-cms` |
| Public URL | `https://cms.stor4.srv938083.hstgr.cloud` |
| Admin panel | `https://cms.stor4.srv938083.hstgr.cloud/admin` |
| CRM Dashboard | `https://cms.stor4.srv938083.hstgr.cloud/admin/crm-dashboard` |
| Auto-deploy | GitHub Actions → SSH → `/opt/stor24-cms` on push to `main` |

## Related services

| Service | Container | Notes |
|---|---|---|
| Database | `stor4_db` (postgres:16-alpine, **shared** with frontend) | Port 5433 on host → 5432 in container |
| Frontend | `stor4` | Consumes CMS content + media via REST API |
| n8n | `root_n8n_1` | Writes new contacts/deals into CMS via API key auth |
| Reverse proxy | `root_traefik_1` | Routes `cms.stor4.srv938083.hstgr.cloud` to this container |

**Important:** The CMS shares its Postgres database (`stor4_db`) with the frontend project. This database container is defined in the **frontend's** docker-compose, not the CMS's. The CMS connects to it over the `root_default` Docker network. If the frontend's `stor4_db` container is recreated, it must remain (or be reconnected) to `root_default`, or the CMS will fail with `getaddrinfo EAI_AGAIN stor4_db`.

## Collections

| Collection | Purpose |
|---|---|
| `users` | Admin auth, API key enabled (`useAPIKey: true`) for n8n integration |
| `storage-units` | Unit sizes/pricing shown on frontend |
| `media` | Uploads — blog images, hero image, 404 image, etc. Publicly readable. |
| `posts` | Blog posts |
| `faqs` | FAQ page content |
| `areas` | Location/area pages |
| `contacts` | CRM — leads/customers. Public create (n8n), admin-only read/update |
| `deals` | CRM — pipeline records linked to contacts. Stages: `new_lead`, `quoted`, `viewing_scheduled`, `active`, `churned`, `lost` |
| `activities` | CRM — notes/calls/activity log linked to contacts |

SEO plugin applied to `posts`, `areas`, `storage-units`.

## CRM Dashboard

Custom admin views registered in `payload.config.ts` under `admin.components.views`:

- `Dashboard` at `/admin/crm-dashboard` — stats, 7-day leads chart, deals pipeline with one-click stage transitions, recent contacts
- `ContactDetail` at `/admin/crm-dashboard/contact?id=X` — full contact view, deal stage actions, activity timeline + add-note

Custom admin theme (dark sidebar) defined in `src/app/(payload)/custom.scss`.

## Docker setup

### docker-compose.yml — NOT TRACKED IN GIT (intentional)

Lives only on the VPS at `/opt/stor24-cms/docker-compose.yml`. Untracked to prevent it being reverted by git operations.

```yaml
services:
  stor24-cms:
    build: .
    container_name: stor24-cms
    restart: unless-stopped
    environment:
      - PAYLOAD_SECRET=440723c7a04f856ccc2f807f7db249208cbaf3bd963b180a9d081bb50c819e14
      - DATABASE_URI=postgresql://stor4_user:stor4_pass@stor4_db:5432/stor4_db
    volumes:
      - stor24_media:/app/public/media
    networks:
      - root_default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.stor24-cms.rule=Host(`cms.stor4.srv938083.hstgr.cloud`)"
      - "traefik.http.routers.stor24-cms.entrypoints=websecure"
      - "traefik.http.routers.stor24-cms.tls=true"
      - "traefik.http.routers.stor24-cms.tls.certresolver=mytlschallenge"
      - "traefik.http.services.stor24-cms.loadbalancer.server.port=3000"
      - "traefik.docker.network=root_default"
volumes:
  stor24_media:
networks:
  root_default:
    external: true
```

**To migrate**: change the `Host()` rule to the new domain. If the database also moves, update `DATABASE_URI` accordingly.

### Migrations

Payload migrations live in `src/migrations/`. This directory must exist (even empty with a `.gitkeep`) or `payload migrate` commands fail with "No migration directory found".

**Known issue**: Auto-generated migrations frequently fail with errors like `type "enum_posts_status" already exists` because the migration tries to recreate types/tables that already exist from a previous `migrate:fresh` or manual schema change. When this happens, the practical fix has been to either:
- Manually run the specific `ALTER TABLE` / `CREATE TYPE` SQL needed for the new fields, then insert a row into `payload_migrations` to mark it as applied, OR
- For a fresh database (no data to preserve), use `npx payload migrate:fresh` after ensuring `src/migrations/` has at least one migration file (`npx payload migrate:create --name init`)

## Environment variables reference

| Variable | Purpose |
|---|---|
| `DATABASE_URI` | Shared Postgres connection (same DB as frontend) |
| `PAYLOAD_SECRET` | Payload encryption secret — **different value** from the frontend's `PAYLOAD_SECRET` (legacy var, unused there) |

## API Key Authentication (for n8n)

The `users` collection has `useAPIKey: true`. To get an API key:
1. Log into `/admin`, go to Users → your user
2. Check "Enable API Key", save
3. Copy the generated key

n8n HTTP Request nodes use this header to authenticate writes to `contacts` and `deals`:
```
Authorization: users API-Key <key>
```

Note: `contacts` and `deals` collections have `create: () => true` (public create) specifically so the website's quote form → n8n → CMS flow works without auth for the initial lead capture. The API key is used for any read/update operations from n8n (e.g. the deals creation step which needs to read the just-created contact ID).

## Local development

```bash
cd ~/stor24-cms
npm run dev   # runs on port 4000 (set via --port flag in package.json "dev" script)
```

Local Postgres runs via the frontend's docker-compose (`stor4_db` container, port 5432 locally vs 5433 on VPS — check actual local port with `docker ps`).

After changing `payload.config.ts` (especially `admin.components`), regenerate the import map:
```bash
npx payload generate:importmap
```

Note: local CMS and live CMS are **separate databases and separate media storage**. Contacts/deals/media created in one do not appear in the other. When testing features that reference uploaded media (hero image, 404 image), upload the same file to both local and live `/admin/collections/media/create`.

## Deploy workflow

1. Edit code locally, test with `npm run dev`
2. `git add . && git commit -m "..." && git push origin main`
3. GitHub Actions auto-deploys to `/opt/stor24-cms` via SSH, runs `docker compose up -d --build`

### Manual deploy (if auto-deploy fails)

```bash
ssh root@93.127.186.194
cd /opt/stor24-cms
git pull origin main
docker rmi stor24-cms-stor24-cms
docker compose up -d --build
```

### If CMS shows "getaddrinfo EAI_AGAIN stor4_db" or Application Error

The shared database lost its network connection (usually after the frontend's containers were rebuilt):
```bash
docker network connect root_default stor4_db
docker restart stor24-cms
```

### If schema errors appear after adding/changing fields

See "Migrations" section above. Practical approach: manually run the needed `ALTER TABLE`/`CREATE TYPE` SQL via:
```bash
docker exec -it stor4_db psql -U stor4_user -d stor4_db -c "..."
```
then mark the migration as applied in `payload_migrations` table.

## Known fragile points (for migration)

- **Shared database with frontend** — on a new server, decide whether to keep this shared setup or give the CMS its own Postgres instance (cleaner, avoids the cross-project network dependency that's caused outages).
- **`stor24_media` volume** — contains all uploaded images. Must be copied to the new server's volume, or media (hero image, 404 image, blog images, storage unit images) will 404.
- **API keys** — the n8n integration's API key is tied to a specific user record in the database; if the database is migrated via dump/restore this should carry over, but verify the n8n workflow's Authorization header still works after migration.
- **Custom admin theme/views** (`custom.scss`, Dashboard components) are in the repo and will migrate cleanly with the code.

## Migration checklist (new server)

1. Set up Docker + Traefik on new server
2. Clone `github.com/doveydragon/stor24-cms` (branch `main`)
3. Decide: shared DB with frontend, or standalone Postgres for CMS
4. Recreate `docker-compose.yml` from template above (update domain, `DATABASE_URI` if DB moved)
5. `pg_dump`/`pg_restore` the database (includes CRM contacts/deals/activities data)
6. Copy `stor24_media` volume contents to new server
7. Update DNS for new CMS domain
8. `docker compose up -d --build`
9. Run `npx payload generate:importmap` if needed
10. Verify: admin login, CRM dashboard loads, media images load, n8n can still POST to `/api/contacts` and `/api/deals`
