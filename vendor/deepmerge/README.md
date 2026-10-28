# STOR24 local security patch of deepmerge4.3.1

This private vendored package is not an upstream release. Its version is4.3.1-stor24.1 and npm override resolves deepmerge to this tracked directory.

Upstream: https://github.com/TehShrike/deepmerge/tree/v4.3.1. Original npm bundled dist/cjs.js SHA256:2e5160f84a1141bd927264afe4d15766f1e6cf07daef182b37ff53fea121de7d. Original MIT license and TypeScript declarations are retained. The bundled mergeability implementation needs no additional runtime dependency. Only the CommonJS runtime entry is shipped; existing default import, require, .all and types remain supported.

GHSA-gcqx-w48m-w2h4 / CVE-2026-93753: unconditionally reject __proto__ before assignments in both mergeObject target/source loops. The inherited-property guard, constructor/prototype ordinary-data semantics, null/primitive merges and callback/array/clone behavior remain unchanged. Upstream has no published patched release at preparation time.

The registry audit cannot certify this local code. Required dependency CI additionally tests the vendored patch and lockfile resolution; normal CMS tests exercise the actual installed Payload dependency. Never replace this with a version-only change or an audit exclusion. Remove the override/vendor only after a verified upstream replacement passes these regression and CMS tests.
