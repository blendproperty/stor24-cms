# Migration-only secret mount â€” staging candidate

The overlay adds a separate tools-profile migration service and leaves the CMS application service unchanged. The normal host release still invokes migrations through the CMS service and does not use this overlay.

The overlay names a separately supplied host file and mounts it at /run/secrets/stor24_migration_url only for the migration service. It is not used by the production release workflow. The launcher requires a regular file owned by the container process with no group or other permissions; the host parent and file must be protected. Do not put migration credentials in shared application environment files.

The Compose tests use synthetic values and assert that all ordinary services remain unchanged, that the expected secret source and target occur only on the migration service, and that a missing secret-file path fails. A Linux-only test launches a networkless disposable probe container with a root-owned mode-0600 synthetic file. It does not run an actual migration or demonstrate production host ownership, secret custody, runtime exclusion, live deployment wiring, backup compatibility or rollback. The existing separate migration CLI tests exercise PostgreSQL with synthetic data.

A CRM Windows Docker Desktop probe exposed a Windows-hosted test file to the container as mode 0777; the launcher rejected it as unsafe. Do not weaken the permission check to work around that. The Linux hosted check and production-host validation are separate evidence.

Production rollout remains blocked on a complete consumer/grant inventory, separate runtime and migration credentials and custody, trusted release integration, effective file ownership and mode, live-process exclusion, full backup and restore, user routing, RLS policy coverage and application acceptance. No production roles, credentials, policies or data are modified by this candidate.
