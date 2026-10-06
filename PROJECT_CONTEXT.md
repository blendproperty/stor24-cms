## Origin lockdown prepared and validated - 6 October 2026, 09:22 UTC

- **Implementation:** canonical STOR24 HTTPS routers and legacy catch-all routers receive independently named Cloudflare socket-peer IPAllowList middleware using the official 15 IPv4 / 7 IPv6 ranges. No forwarding-header IP strategy is enabled. Legacy GET/HEAD navigation redirects to canonical domains, including API navigation. Only exact legacy POST provider callbacks retain access; identity uploads and administrative APIs have no exception. HTTP ACME challenges and other shared-host applications are unchanged.
- **Testing:** effective CRM/CMS Compose parses successfully; public runtime renderer validates an exact effective-configuration comparison permitting only specified routing labels, handles existing folded YAML labels, and is idempotent. Forty assertions against Hostinger's installed Traefik 3.7.11 passed using a localhost-only stub: socket-peer denial, forged forwarding-header denial, positive control, legacy redirects, callback method/path/encoded-suffix boundaries. The isolated test container was removed. These tests do not simulate a successful payment, message, signature, identity upload or customer operation.
- **Commit and push:** prepared on codex/cloudflare-origin-lockdown-20261006; pending source commit/push and protected checks at this checkpoint.
- **Merge:** pending normal promotion to the canonical branch; no protected-check bypass.
- **Deployment and configuration:** not yet active. Hold enforcement until at least 10:10 UTC (12:10 South African time) because the previous nameserver delegation cache can still resolve the Hostinger origin. The public deployment applies a versioned, label-only runtime updater with an effective-configuration guard and protected rollback copy; CRM/CMS policies are tracked Compose labels.
- **Live production verification:** pending deployment. Cloudflare cutover remains verified separately below; a live direct-origin block must not be claimed from isolated tests. CIDR filtering is not zone-exclusive mutual authentication. Provider callbacks retain application-level validation; actual provider/device/customer UAT and real certificate renewal remain acceptance gates.
- **Remaining gates:** off-server recovery/independent keys, independent monitoring cadence/coverage, Google developer-token rotation, GA4 API/Viewer access, Meta server token, actual consented conversion reconciliation, provider/payment/finance/device UAT, legal/data/training/business approval remain open. Campaigns remain paused. Facility-map business/security policy remains deferred to Brett/Mark. Asana1217529230514116 remains incomplete.

## Cloudflare edge activation and verified releases — 6 October 2026

- **Implementation / testing:** approved DNS cutover preserves all 22 Hostinger records. Universal SSL is Active for stor24.co.za and *.stor24.co.za (expires 4 January 2027). Apex, www and CMS are now Proxied; portal remains DNS-only at this checkpoint pending its protected router-option release. The other 18 records must remain DNS-only after portal activation. Full (strict), HTTPS redirect, TLS 1.2 minimum, private/transactional cache bypass, managed Free WAF and untrusted forwarded-chain removal are configured.
- **Commit and push / merge:** public PR115 source c004759 merged to canonical master 5b1ab0d9323a46892d01e95abdbb6b03d1a0bd84; all three source security checks and exact-master security37433537377 passed. CMS PR19 source a9c1c15 merged to canonical main 5c7abc9194024d58eb4e7464128a03920353d1ba after effective-Compose validation. CRM PR403 source e9542aa preserves subsequent canonical843b8d8 documentation and is still undergoing normal protected checks; no check bypass.
- **Deployment and configuration:** public normal deploy37433597644 and CMS normal deploy37433460328 SUCCEEDED. Public live5b1ab0d image sha256:882b2634d129a955fcbd1583851ff072f06dbf559c2fc22b8046fd059b3f7b82 is healthy/noOOM; CMS live5c7abc9 image sha256:1bb2a13f3fe8bcbfa2366365671500745d419ddec6a0df74c9296fe55f44db6b uses stor24http and noOOM (CMS has no Docker healthcheck). Shared Traefik trusts only official Cloudflare CIDRs and retains other services' resolver. This final evidence-only update requires its own normal promotion; the above application/runtime evidence must not be relabelled as proof of a later documentation image.
- **Live production verification:** parent co.za delegates fonzie/katja at08:07Z. At08:15–08:17Z authoritative Cloudflare A records resolve to edge addresses. Strictly validated HTTPS through those addresses returned website health200, www301 and CMS admin307, each with Cloudflare server/ray and DYNAMIC cache status; private health/CMS/booking responses retain no-store. Booking200 passed. HTTP challenge absent-token probe404 through Cloudflare has no redirect: handler reachability only, not successful renewal. Authoritative MX5/10, SendGrid CNAME/DKIM and Hostinger DKIM readback passed. Fresh read-only DNS table confirms only the three approved web records are proxied at this checkpoint.
- **Open acceptance gates:** portal proxy after protected release, actual origin renewal, direct-origin/legacy bypass restrictions, authenticated checkout/CMS/provider UAT, off-server recovery and independent keys, independent monitoring/cadence/coverage, Google developer-token rotation, GA4 permission/API and Meta server token, consented real conversion reconciliation, payment/finance/device/legal/data/training/business approval remain OPEN. Campaigns remain paused; facility-map policy remains deferred to Brett/Mark. CloudSphere99442 is backup acknowledgement only. Asana1217529230514116 remains incomplete.

## Validated Cloudflare prerequisites — 6 October 2026

- **Implementation / testing:** effective Docker Compose comparison passed for CRM and CMS: default candidates exactly equal existing effective configuration; setting STOR24_CERT_RESOLVER=stor24http changes exactly one canonical router label each. Both legacy routes retain mytlschallenge. Public protected Compose changes only stor24-public and stor24-www resolver labels; existing image, bounds, logs, dependencies and credentials are preserved. The public container was recreated with the same validated59869b0 image and is healthy.
- **Deployment / configuration:** separate stor24http HTTP-01 resolver is running on Hostinger port80 with four existing valid STOR24 certificates seeded into mode600 local ACME storage. Non-secret STOR24_CERT_RESOLVER=stor24http added to protected CRM/CMS environment files for the next validated release. Root effective configuration changed only by four resolver and two forwarded-header trust arguments; protected original copies retained. Header trust is limited to the official Cloudflare IP API's15 IPv4 and7 IPv6 CIDRs, with no arbitrary-proxy trust. Cloudflare active request transform df9d88aa77444fcea836c5496e4af10a removes incoming x-forwarded-for before Cloudflare's backend adds the visitor IP; cookie/auth headers are untouched. Latest Traefik restart08:00:57Z.
- **Live verification:** subsequent website and CRM health200, booking200 and CMS admin307 passed. HTTP ACME probe returns404 directly without HTTPS redirect, confirming HTTP challenge handler reachability for an absent token; this is not a successful certificate issuance or renewal. Parent delegation still showed old nameservers at08:01Z although Hostinger accepted the new nameservers. Zone/edge certificate/proxy/WAF/cache/header acceptance remains PENDING; all22 DNS records remain DNS-only until Universal SSL is active.
- **Commit and push / merge:** this dated context and any canonical router option are promoted through normal PRs (CRM403, public115, CMS19). No protection bypass is authorized; merge/deploy proof is tracked separately from this candidate checkpoint. Prior exact-main681 CRM and598 public application release remain independently verified. All existing off-server recovery, independent monitoring, provider/credential/conversion, legal/data/training/UAT/business approval gates remain OPEN.

## Cloudflare-compatible CMS origin renewal — 6 October 2026

- **Implementation:** canonical CMS router supports optional STOR24_CERT_RESOLVER, with unchanged mytlschallenge default. Both legacy routers retain the original resolver. Hostinger has a STOR24-specific HTTP-01 resolver using port80 and separate protected ACME storage; existing valid STOR24 certificates were seeded locally, with no key disclosure or forced reissuance. CMS application/editorial/authentication behavior is unchanged.
- **Testing:** root effective-Compose comparison allows only four new resolver arguments. Configuration validation passed; public/CRM health200, booking200 and CMS admin307 passed after Traefik restart07:55:57Z. CMS Compose default/override comparison and canonical promotion remain required.
- **Commit and push / merge / deployment:** this scoped Compose option and context are a candidate pending normal promotion. Existing CMS application release and unrelated editorial changes are preserved. Hostinger environment selection and CMS container recreation follow only after exact configuration validation/promotion.
- **Cloudflare configuration:** Brett explicitly approved nameserver/proxy activation. All22 Hostinger DNS records reconciled in company Free zone; six missing records added and seven mail/DKIM proxies corrected. Hostinger accepted fonzie.ns.cloudflare.com and katja.ns.cloudflare.com. Strict HTTPS, minimumTLS1.2, HTTPS redirects and cache bypass for allCMS/portal and transactional public routes saved. Delegation/certificate propagation pending; all22 records staged DNS-only, so no claim of active proxy/WAF protection. Mail continues on Hostinger.
- **Live acceptance / remaining gates:** origin certificates remain valid to28–29December2026; full HTTP-01 renewal through Cloudflare is not yet exercised. Edge-certificate/proxy/route/mail acceptance pending. Off-server recovery and independent keys, reliable external monitoring, GA/Meta credentials/conversion reconciliation, provider/payment/device/legal/data/training/business UAT remain OPEN; CloudSphere99442 acknowledged only, map decision deferred to Brett/Mark, Asana1217529230514116 incomplete.

# STOR 24 CMS — Project Context

## Micro Warehousing CMS release — 6 October 2026

- **Implementation:** editorial Micro Warehousing global, five media references, approved copy/FAQ/facility JSON, publication switch and SEO fields; reversible additive migration. CMS account-recovery email adapter uses the company SendGrid sender and fails closed if unconfigured. No credential is stored in code or context.
- **Testing:** Payload type generation and local TypeScript passed; production build and additive migration passed in deployment workflow 37407816690. Authenticated editorial publishing and public media readback passed. Sender-envelope normalization was separately typechecked and passed the production build/deployment in workflow37408846128.
- **Commit and push:** source cf30173 pushed on `codex/micro-warehousing-20261006`; sender source295e59a subsequently pushed; remote main verified at7692d0f5e0226c275ca843e04dafe54da64c9b96 after promotion.
- **Merge:** PR11 merged normally as 56f9c9aa014e9f3cbefed15bbe3dd3741cda731e. PR12 merged normally as7692d0f5e0226c275ca843e04dafe54da64c9b96. This final documentation-only evidence update is promoted separately without changing the tested runtime.
- **Deployment and configuration:** workflow37407816690 deployed the initial merge; workflow37408846128 successfully deployed sender normalization at7692d0f5e0226c275ca843e04dafe54da64c9b96. Read-only inspection verifies /opt/stor24-cms at that SHA and the CMS container running since03:27:04Z. Protected company email configuration was added to the CMS runtime; no credentials are committed. Pre-release database/environment/homepage backups are retained under /opt/backups/stor24-cms-micro-20261006. No payment, access or financial automation is enabled by this work.
- **Live production verification:** CMS global is published; homepage image 26, business hero 27, growing/detail interior 28, compact interior 29 and large interior 30 are stored in the CMS and publicly readable. Reset request returned HTTP200 and the actual Reset Your Password message reached brettd@blendproperty.co.za at03:16:04Z, with a fresh message received03:53:51Z. Existing account/password was preserved; following the reset link is still the user's step. Public website and CRM technical release evidence is recorded in their companion canonical contexts; customer lifecycle UAT remains open.
- **Open gates:** owner selection of pilot ground-floor units and their exclusive/shared designation; business permitted-use rules and legal addendum; authenticated booking CAPTCHA/OTP/customer UAT; real payment/access/finance provider acceptance, data reconciliation, staff training, approvals and independent backup/recovery remain OPEN. Later reporting/add-ons/multi-user access/offline conversions and optional use-case routes in the draft scope are not implemented by this MVP. Existing legal signing amounts and provider boundaries are retained.

### CMS default-copy follow-up — 6 October 2026

- **Implementation:** corrected the fallback accent's source encoding to plain ASCII "We've got room.". Published editorial copy was already correct. **Testing:** TypeScript and normal production build passed. **Commit/push:** source7539cb4 pushed; **Merge:** PR14 normally merged as maineae6d3ef8142d9395f6b6b68e79e65ad5d662ab2, with merged tree equal to tested source. **Deployment/configuration:** normal CMS workflow37411699013 succeeded; explicit workflow dispatch recovered inherited skip-ci text in the squash message. No schema or email configuration change. Running image sha256:e17660961db6d8a2785bb22bc5c6f2c956b66a325a00c1b55a79d0bd3f4bd0d3 started04:03:48Z, checkout equals eae6d3e. **Live production verification:** published global and image-backed public homepage/landing remain readable after deployment; fresh reset email received03:53:51Z from STOR24 Content Studio. All open gates above remain unchanged. This final evidence-only follow-up changes PROJECT_CONTEXT.md only.


## Official CI and content ideas - 30 September 2026

- **Implementation:** replaced the incorrect text-built logo with the official 611:160 outlined artwork used by the public website. Applied shared ink #071411, cream #F5F3EA, orange #FF5A0A, navigation and action styling throughout Payload screens. Verified genuine Satoshi Variable WOFF2 from Fontshare has a wght axis 300–900: the older brand-pack TTF was actually a static Bold instance despite its filename and is not used. Added authenticated-only Content ideas with search phrase, audience, brief, research, format, priority, planned date, progress and finished-content link. Ideas never publish website pages. Provenance is in docs/STOR24_BRAND_CI.md.
- **Testing:** generated types/import map, TypeScript, targeted ESLint and diff checks passed. Production build passed at source 542adddea69fcf17f640be9fe1f9895556f942fe. Additive migration passed on an isolated production DB copy. Six focused CRUD/access/validation checks passed (create, update/readback, anonymous denial, invalid URL, invalid status, cleanup). Browser creation, Ready to write status save and reload passed; 34 responsive checks across 17 CMS routes at 1440px and 390px passed without rendered errors/overflow. Final login branding checked separately. Preview had an internal-only network, SSH tunnel and read-only media; all preview records stayed in the copy.
- **Commit and push:** source 542adddea69fcf17f640be9fe1f9895556f942fe pushed. Release evidence is committed in a separate documentation PR and must be verified on origin/main before handoff.
- **Merge:** PR9 merged as bdfa57483640504e009d6fa4d62d31cf24be627e; implementation branch deleted. Merge used skip-ci to promote the exact tested image rather than the legacy unverified rebuild. Source comparison from tested commit to origin/main passed.
- **Deployment and configuration:** additive 20260930_120000_content_ideas migration applied once (68ms), then exact image sha256:51428176e4570c702838b34d3a0097f1ff40179f5ce73bf34bc420cd7bebeec4 started 2026-09-30T08:33:01.759007765Z. Only stor24-cms recreated. Full environment and media mounts match pre-release; routing labels unchanged. Only expected image digest/revision labels differ. Protected immediate DB/config backups, migration/build/deployment evidence: /root/stor24-brand-20260930. Rollback image: stor24-cms:pre-brand-20260930; additive ideas schema can remain when rolling back the UI.
- **Live production verification:** 20 authenticated browser checks (16 routes at the user's default viewport plus dashboard/ideas/list/create/article mobile coverage) passed. Login HTTP200; anonymous /api/content-ideas HTTP403. All six public content API hashes unchanged. Live logo and font hashes verified against release assets; original logo geometry preserved (only source LF versus Windows archive CRLF differs from the public website). Local evidence/screenshots: Sitelink/output/cms-brand-20260930. No sample ideas or changes to published articles were added to production.
- **Open gates:** user review of corrected CI and editorial workflow, content strategy/accuracy, organic search outcomes, and all earlier infrastructure-secret rotation, MFA/CSP, dependency/security, provider, legal, finance, access, data, training and approval gates remain. Existing SMTP configuration is still absent; this task does not claim password-reset email delivery or overall launch readiness.

## SEO workspace - 30 September 2026

- **Implementation:** SEO is now the dashboard priority, with permission-respecting saved-content checks, published-first improvement links, Google Search Console and PageSpeed entry points, and reactive article/guide writing checks and search previews. Existing metadata/data paths retained; no schema, production content, account or provider change. Google metrics remain in the authorised Google account, explicitly not imported into the CMS. Live saved-content check found three published items, two with editorial improvements to review.
- **Testing:** TypeScript, targeted ESLint and four focused audit tests passed. Production image built successfully at 4e10a12e4ebfad2fab718f36e5a200baf31f6e66. Six browser checks covered dashboard/article/guide at 1440px and 390px without rendered errors or overflow. A changed article search title updated the preview immediately and persisted after save/reload in an isolated database copy. Preview used an internal-only network and read-only media mount; no production content was edited.
- **Commit and push:** implementation 4e10a12e4ebfad2fab718f36e5a200baf31f6e66 and validation 1d2cb964a4c5df98c413b8bfd73fa23ed2ddd250 pushed from verified main 2f42fe3. Primary checkout and VPS graphify-out preserved. Final evidence is committed separately and must be verified on remote main before handoff.
- **Merge:** PR7 merged as 6e68cb3c785dbbf3faaa734b75fce89878fe9bc1 with skip-ci to promote the already-tested image without the legacy workflow's unrelated rebuild/migration. Source comparison against tested SHA passed.
- **Deployment and configuration:** exact image sha256:a7a5635171051c9062efcd9a71f8b69dad2cd7248d41674b8ccddeb67b1fe1a3 started 2026-09-30T07:09:58.272Z. Only stor24-cms recreated with no build/migration; complete environment and mount comparisons matched. VPS checkout fast-forwarded to merge SHA. Protected backup/build/deployment evidence is in /root/stor24-seo-20260930; rollback image is stor24-cms:pre-seo-20260930. Google domain property ownership verified in Brett's existing account through Hostinger DNS CNAME, with TXT also retained. Google processed the canonical sitemap successfully and discovered 19 pages on 30 September. Public-site deployment and detailed evidence are in companion stor24/PROJECT_CONTEXT.md.
- **Live production verification:** six authenticated desktop/mobile dashboard/article/guide checks passed. All six public content API snapshot hashes were unchanged at 07:10:30Z. Local browser evidence and screenshot are in Sitelink/output/seo-20260930. Google reports currently say data is processing; no clicks, rankings or indexed-count result is claimed.
- **Open gates:** editorial accuracy, keyword/content strategy and real production publishing acceptance; Google report data/organic outcomes; existing infrastructure-secret rotation, MFA/CSP, dependency/security, provider, legal, finance, access, data, training and approval gates. Two existing articles still have writing checks to review. No overall readiness or ranking claim.

## Content Studio redesign - 30 September 2026

- **Implementation:** replaced the bare collection dashboard with an editorial workspace: permission-aware real content counts, homepage editing shortcut, recent updates and publishing guidance. Shared Satoshi typography, ink/cream/orange styling covers navigation, lists, search/filter controls, document forms, media, account and sign-in. Content labels and descriptions clarify the purpose of each section; articles, guides and location pages use structured, unnamed form sections and publishing sidebars. Status badges distinguish drafts and published content. Default navigation, permissions, validation, rich-text editing, media controls and save actions remain in use. API tabs are hidden from the editorial interface without changing API routes.
- **Testing:** TypeScript passes; targeted ESLint has zero errors and three existing explicit-any warnings in payload.config.ts. Generated type comparison found all 23 existing interface contracts unchanged, ignoring property order and descriptions. Production build for exact source ad37d5792017530d2903df520e397c2e33083f4d passed. Isolated PostgreSQL/media copies were used to verify article and guide updates, FAQ and location creation, and homepage saves with persisted readback. Search and empty states worked. The final artifact passed 30 browser checks (15 dashboard/list/editor/account routes at desktop and 390px phone sizes) with zero rendered application errors or page overflow. Login, create templates, menu behaviour and account access were also reviewed. Local evidence: Sitelink/output/cms-redesign-20260930/release-ad37d57-audit.json and associated screenshots.
- **Commit and push:** implementation commits 1e41ddd, e624263, cae47ca and ad37d5792017530d2903df520e397c2e33083f4d were pushed from verified main d507e4e6e35b1ff7503964a5f86740a49f89712b. Primary checkout and VPS graphify-out were preserved. Release documentation is versioned separately and verified on remote main before handoff.
- **Merge:** PR5 merged as b50eb54561f98886e1885520f42bfaa1b14062aa; its short-lived branch was deleted. Skip-ci intentionally avoided the legacy workflow's unrelated rebuild/migration step; the tested artifact was promoted directly. Merge source matches the tested source for src, public, package manifests and application configuration.
- **Deployment and configuration:** exact tested image sha256:2b995c74e0c5b22d37afd765ca40f79f32cef0c59c84978ccf12642270c075ee (revision ad37d5792017530d2903df520e397c2e33083f4d) started in production at 2026-09-30T06:46:59.690Z. VPS checkout was fast-forwarded to b50eb54, and only stor24-cms was recreated with no build or migrations. Full runtime environment and media mount comparisons matched the pre-deployment container. Root-only /root/stor24-cms-editorial-20260930 retains the production backup, build logs and deployment/live-health evidence; previous image tag stor24-cms:pre-editorial-20260930 supports code-only rollback by restoring the Compose image tag and recreating this service. Preview containers, named media volume, temporary credentials and SSH tunnel were removed after validation. No public-site or CRM source change was necessary.
- **Live production verification:** canonical authenticated dashboard and all six content lists/editor templates plus account/homepage passed 15 live route checks; dashboard, article editor and homepage editor also passed live 390px checks. Six public content API snapshots (homepage, articles, guides, FAQs, locations and media) matched their pre-deployment SHA256 hashes exactly. At 06:48:50Z the public website health reported CMS and CRM healthy, portal health reported database OK, CMS login/font requests returned 200, and anonymous users API remained 403. Recent CMS logs had no TypeError, ReferenceError, missing-relation or unhandled-error indicators. Live screenshot and audits are under Sitelink/output/cms-redesign-20260930. No production content was edited or published by the tests.
- **Open gates:** interface implementation, promotion and live read-only verification are complete. Brett's editorial/design acceptance, a real production publishing/preview exercise, and the existing infrastructure-secret rotation, MFA/CSP, provider, legal, payment/access, finance, data, training and approval gates remain separate. Dependency installation reported an existing Next.js 15.2.3 advisory; no dependency upgrade is included in this interface change. No overall business-readiness claim.

## CMS account recovery - 30 September 2026

- **Implementation:** at Brett's explicit request, renamed the existing CMS account from its Gmail login to brettd@blendproperty.co.za and reset its password through Payload's supported Local API. Existing account ID and permissions preserved; no additional account created. Cleared the account lockout fields. A cryptographically random password was delivered through the local clipboard; temporary transfer files were deleted. No credential is recorded here. The password does not automatically expire; Brett should replace it in his account settings.
- **Testing:** production-mode Local API execution returned success and confirmed the account ID was unchanged. HTTPS login on the canonical CMS returned 200 for the new email; a subsequent cookie-authenticated users/me request returned the matching account. Real Edge browser sign-in reached the CMS dashboard at https://cms.stor24.co.za/admin on 30 September 2026, approximately 06:03 UTC.
- **Commit and push:** this documentation-only recovery record is committed through a short-lived codex branch based on remote main 5697cf264fcf2abe36d91dbb4f8ddcf9e38896f7. Remote main and this record must be verified before handoff; no application-code change is part of recovery.
- **Merge:** documentation PR is merged to main with skip-ci after reviewing its documentation-only diff. The resulting merge evidence is retained in GitHub history.
- **Deployment and configuration:** the authorized account change was applied directly to the existing production CMS through Payload in explicit production mode. No image rebuild, application deployment, schema migration, routing change or permission expansion was required. Existing image and media remain in place.
- **Live production verification:** both canonical HTTPS cookie authentication and the browser dashboard succeeded with the new login. This closes the account sign-in check only; no content was saved or published during verification.
- **Open gates:** editorial save/publish/preview UAT, historical infrastructure-secret rotation evidence, MFA/CSP, provider, legal, payment/access, finance, data, training and approval gates remain open. No claim that all prior sessions were revoked, that the password expires automatically, or that overall business readiness is complete.

## CMS domain migration - 30 September 2026

- **Implementation:** canonical CMS address is https://cms.stor24.co.za/admin. Tracked Compose adds canonical HTTPS routing and legacy GET/HEAD page redirects preserving path/query. Legacy APIs/media remain direct for compatibility. CMS remains editorial-only. Public website accepts the new image/connect origin and its Docker builder now consumes NEXT_PUBLIC_CMS_URL.
- **Testing:** resolved Compose comparison confirmed only routing labels changed; environment, networks and volumes match. Recreated only the CMS with no build; exact image ID and media mounts unchanged. Authoritative/Google/Cloudflare DNS returned 93.127.186.194. Canonical and legacy homepage-hero payloads match, including three slides; all three image files return 200 with identical SHA256 content. Anonymous users API remains 403. No schema/data migration, content edit, account or credential change performed.
- **Commit and push:** implementation f4f4d6279251595c644df80ed3c33dd6f024c185 pushed from canonical main cfb481344fa9f2096481b323844c6751b5dbe48a. Isolated clone used; primary/VPS unrelated files preserved. Final dated evidence is versioned separately; remote main and PROJECT_CONTEXT.md presence verified before handoff.
- **Merge:** CMS PR2 merged as 8dfeca413ecca1cd905a50dbff88b862572dcf50 and its merged branch deleted. No application-source change: existing image source 340a887609e57556c4194b9bf5c11c8c91641104 differs only in routing/documentation. Skip-ci avoided an unrelated CMS rebuild/database migration. Public companion PR86 merged as 71dea8077a9fbff10ec74d912fc1dd1a62ee861f; its build/security and deployment 36661952824 succeeded. Monitoring PR87 merged as 761e17931197dbefac952b21ae2a8df17e4d2e07.
- **Deployment and configuration:** Hostinger cms A record 93.127.186.194 TTL60 and persistent CMS Compose applied at 2026-09-30T02:49:43Z. VPS CMS checkout reconciled to 8dfeca4 with identical running image/media. Website NEXT_PUBLIC_CMS_URL build/runtime now https://cms.stor24.co.za; private CMS_URL remains http://stor24-cms:3000. Website container recreated at 02:56:31Z. Root-only /root/stor24-cms-domain-backup-20260930 retains original CMS/public Compose and environments plus CMS image/mount identifiers. Rollback restores the relevant URL/routing settings and recreates only the affected apps; reverting the website public media origin requires rebuilding its browser bundle. No database restore is part of domain rollback.
- **Live production verification:** new admin login 200 and visibly rendered in a real browser. Valid HTTPS certificate covers cms.stor24.co.za through 29 December 2026. The supplied old admin URL redirects 301 preserving its nested redirect query; legacy hero API remains direct 200. Website image optimizer accepts the canonical CMS URL (200); browser shows all three hero images loaded from that origin. Website and portal health both passed at 2026-09-30T02:57:03Z. Production monitor 36662060554 and responsive-browser workflow 36662063174 passed on the corrected canonical website URL. Users sign in again on the new hostname; no session material copied.
- **Open gates:** authenticated editorial login/save/publish/preview UAT was not performed. Previously recorded credential-rotation evidence, CMS MFA/CSP and other security/editorial gates remain open, as do existing legal/provider/payment/access/finance/data/training/approval gates. No tracker acceptance or overall business-readiness claim.
> Last reviewed: 30 September 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

## Verified production baseline — 31 August 2026

- Repository `blendproperty/stor24-cms` production branch `main` is at `694ac9389bf24b9e730b4413698d2f9c4a2f90c1`. GitHub deployment run `#23` completed successfully for that exact commit.
- The live admin route redirects to the login screen and returns HTTP 200. The live read-only `homepage-hero` global returns HTTP 200 with the saved headline, copy, benefits and populated slide media, proving that the migration and configured global are present in production.
- The public portal is deployed at `a0db67252e95da04c95bf0a6687b3a4b5bc16db3` (deploy `#143`) and its `/api/health` reports CMS and CRM healthy. This closes CMS migration/API readback, but desktop/mobile visual acceptance remains a separate gate.

## CMS-managed homepage hero — implemented 29 August 2026, deployment verification pending

- Added the editorial-only `homepage-hero` global. Authorised CMS users can edit every visible hero sentence, the size-guide CTA, mobile benefit-card copy, and up to three approved hero images without changing public-site code.
- Each image supports a desktop asset, optional mobile crop, alt text, contain/cover fit and focal alignment. Editors can leave rotation off or enable a restrained 6–20 second crossfade; the public site respects reduced-motion preferences.
- The public contract is read-only at `/api/globals/homepage-hero?depth=1`. The public portal keeps its current approved hero content and local artwork as a resilient fallback if the global has not yet been saved or the CMS is unavailable.
- Migration `20260829_104700_add_homepage_hero` creates the global and its slide/benefit arrays. Do not call this live until the CMS deployment has run the migration and the public homepage has been deployed and verified against the approved desktop reference and mobile layout.

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

### Customer and lead ownership task close-out — 31 August 2026

- **Implementation:** no new CMS feature was added. The cross-repository contract is reconciled so that customer, lead, reservation, tenancy, occupancy and operational-audit truth belongs only to `stor24-portal`; this CMS remains editorial content, approved media and publication state only.
- **Testing / validation:** current `src/payload.config.ts` exposes the editorial collections and `homepage-hero` global, while the retired CRM-shaped collection definitions are absent. Historical removal migrations and the production-confirmed admin cleanup remain the enforcement evidence.
- **Commit and push:** this documentation-only close-out is committed and pushed to `main`, with remote presence checked using `git show origin/main:PROJECT_CONTEXT.md`.
- **Merge:** promoted directly to `main`; no runtime-code merge is involved.
- **Deployment / configuration:** none required for this context-only change.
- **Live production verification:** no new production mutation was performed. The previously verified production removal of the CMS shadow CRM remains the applicable live evidence. Secret rotation, CMS MFA, publication workflow and the duplicated `(frontend)` decision remain open.
- **Follow-up preserved:** the public portal's legacy `/pricing` source still requests the retired CMS `storage-units` endpoint. That consumer must be removed or moved to a sanitised CRM pricing contract; this CMS must not restore the retired collection.

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

## Programme evidence refresh — 31 August 2026

- The CMS ownership and publishing boundary is now closed in Asana: CMS owns editorial content, approved media and publication state only; operational/customer/inventory/finance truth remains outside this repository.
- Mainline commits through 30 August add the editable `homepage-hero` global, homepage media validation and protected homepage copy/link rules. The public portal contains resilient approved fallbacks.
- Do not convert those commits into a production-complete claim without current CMS migration evidence, API readback, authenticated editor workflow proof and public desktop/mobile visual verification.
- The public/CMS homepage safeguards now include responsive regression coverage and scheduled production smoke monitoring. Current live evidence must still identify the exact deployed revision and affected-route result.
- Previously exposed `PAYLOAD_SECRET` and database credentials must remain treated as compromised until rotation is positively verified. CMS MFA, the Payload-specific CSP follow-up, README collection-list correction and the duplicated `(frontend)` decision remain open.
- Asana programme `1217529585497952` records 46 tasks: 21 complete and 25 open; overall status is amber / at risk. This count is not a weighted delivery percentage.
## Micro Warehousing correction — 6 October 2026

- **Implementation:** preserve original homepage images22/23/25 and9-second rotation; increase carousel capacity to six and append official-logo business illustration31 as the fourth slide. Micro Warehousing hero also uses31. The obsolete invented-logo images are unreferenced by these globals; original assets remain available. Existing account identity preserved; no password or schema change.
- **Testing:** CMS TypeScript passed; deployment production build passed. Authenticated Payload readback and public API confirm slides22/23/25/31, rotation enabled and9-second interval. Live browser observed the active image change and four slides; Micro hero31 loaded at1440/820/390/320. No customer or financial writes. Initial fourth-slide attempt was rejected by the old three-row limit; schema-push prompt was stopped without acceptance, and publication used NODE_ENV=production.
- **Commit and push:** sourceeace7d8 pushed from verified canonical bed3c0c. This final evidence-only follow-up is promoted separately.
- **Merge:** PR16 merged as e57ea44ce8c1849269b86bb359cb89321d1936e4. Final evidence-only promotion and canonical context presence are verified in the handoff.
- **Deployment and configuration:** normal deployment37415295403 succeeded. Read-only inspection verifies /opt/stor24-cms at e57ea44, image666076eb9106, started2026-10-06T04:48:38Z. Corrected illustration uploaded as media31 through the existing authenticated account; both globals published through access-controlled Payload API. Homepage public release591b247 reads these four slides.
- **Live production verification:** four-slide carousel rotation observed and official CMS hero loaded on the served site; publication and image loading verified, with illustrative concept labeling retained. No claim of facility photography or real customer/provider completion.
- **Open gates:** owner unit designation and permitted-use/legal/customer UAT, provider, data, staff training and independent recovery gates remain as recorded in companion contexts. Password-recovery delivery acceptance remains distinct from image publication.

### Current CMS content readback — 6 October 2026

- **Configuration/live verification:** newer CMS homepage edit observed2026-10-06T05:15:12.100Z supersedes the earlier four-slide readback above: six slides22/23/25/32/33/34, rotation enabled every9 seconds. Original three retained; new business illustrations use CMS assets. Concurrent edits preserved. Micro landing hero remains official-logo media31. Live carousel rotation and six slides verified at05:21Z; business retail/trade scenes visually inspected with STOR24 branding. No schema or runtime change in this evidence update.
- **Implementation/testing/commit and merge/deployment:** functional CMS release remains PR16/e57ea44, deployment37415295403; context PR17/e36df0b already promoted. This addendum changes only PROJECT_CONTEXT.md and does not require a runtime redeploy. Publication evidenced in Git history.
- **Gates:** inventory designation and real customer/provider/analytics UAT remain open as recorded in canonical website and CRM context; no customer transactions performed.
