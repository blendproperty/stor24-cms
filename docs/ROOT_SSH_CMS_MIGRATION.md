# CMS deployment SSH migration — source candidate only

The live CMS has not changed. Website deployment is already migrated; global root SSH remains enabled for CMS/CRM/other shared-host consumers and independently verified human/recovery access.

The proposed stor24-cms-deploy identity uses a separate service key, root-owned forced-command key storage, one argument-free sudo handler, no Docker/general sudo group membership, no PTY/forwarding/user RC, and size/time-bounded typed JSON for preflight or deploy. The server accepts only exact current-main source with the latest successful main-push security.yml run; the existing dependency gate remains required. A short-lived read-only GitHub Actions token is transported in encrypted SSH stdin, never privileged child arguments/environment or logs. The server validates release evidence twice and rejects runtime environment drift before migrations.

## Preserved deployment contract

Source is an immutable git archive in a unique root-owned release directory. Each attempt gets a distinct root-only custom-format database dump, archive-list check, runtime-env copy and previous image tag. The old image is retained. Normalized candidate Compose must match the actual prior protected immutable Compose except its build context and versioned image tag, preserving project/service/media volume/network/routing/environment. Deliberate Compose changes need a separate administrator review. Do not broaden this account for that purpose.

The migration command uses the candidate image with stdin closed and --no-deps. Only CMS is recreated. Health and actual revision must pass. Migration failure before cutover preserves the current image. After cutover failure the prior image is attempted with the verified equivalent Compose; additive data is retained and no automatic database restore occurs. Historical migrations are not all additive; the current registered migration set must be reconciled with the live ledger before any approved deployment. Timeout/disconnect signals terminate the privileged subprocess group and attempt the existing image recovery; a failed or interrupted operation still needs host reconciliation before retry. Docker daemon work is not atomically cancelled by killing its client.

Approved source/Dockerfile/package scripts and other existing root credentials remain trusted. This is a restricted deployment interface, not a sandbox against approved maintainers. The final GitHub check and Docker cutover are not atomic, though rechecked under a host lock. Failed release directories/backups are retained for review; no automatic pruning or data restore.

## Tests and evidence boundaries

Focused Linux unit tests cover request parsing, current-main/workflow identity and superseding failures, command rejection, clean environment/closed stdin, lock contention, stale-main/env drift and process-group cancellation. A disposable networkless Ubuntu test uses real SSH/sudo for the access boundary. Its separate lifecycle fixture explicitly stubs Docker/database commands to exercise immutable source, unique backups, config drift, migration stdin, failure and image recovery; it does not prove a real database restore or real CMS cutover. Existing normal security integration remains isolated from production.

## Approval and release gates

1. Complete source review and applicable checks. The Low deepmerge advisory GHSA-gcqx-w48m-w2h4 currently has no published patched version and blocks the enforced dependencies check. Do not change thresholds, override branch rules or reuse the earlier documentation-only exception for a runtime release.
2. Separately approve host account/handler/exact sudo/SSH Match installation and a distinct service key in VPS_CMS_DEPLOY_USER and VPS_CMS_DEPLOY_SSH_KEY. The current prior immutable Compose is root-owned0664 inside a root-only0700 release directory; normalize that verified file to0644 during approved setup, because the new protected-file policy rejects group-write permission. Future archives use tar --no-same-permissions under umask077. Preserve existing root keys and CI secrets. Validate syntax before SSH reload and run fresh actual negative tests plus candidate operation=preflight.
3. Recheck recovery, actual pending migrations, media/DB/env/previous image and backups. Separately approve source promotion and a brief CMS/website-content interruption; no other service or DB recreation, full data restore, reboot or customer/provider transaction is included.
4. Verify exact source/image/health/media/database/other workload state, then update canonical PROJECT_CONTEXT.md and verify normal promotion/default-branch readback.
5. Migrate remaining CRM/shared-host consumers and verify fresh human sudo and independent recovery before global root denial. Native PostgreSQL5432 is a separate reviewed restart/binding step.
