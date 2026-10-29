import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyCmsXss } from './xss-browser.mjs';

assert.equal(process.env.CMS_SECURITY_DB_TEST, 'isolated-ci');
const uri = new URL(process.env.DATABASE_URI);
assert.ok(['localhost', '127.0.0.1'].includes(uri.hostname));
assert.ok(uri.pathname.endsWith('_ci'));
assert.ok(process.env.PAYLOAD_SECRET?.startsWith('synthetic-'));
const { Client } = createRequire(import.meta.url)('pg');
const database = new Client({ connectionString: uri.toString() });
await database.connect();
if (process.argv.includes('--bootstrap')) {
  const tables = await database.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public'");
  assert.equal(tables.rows[0].count, 0, 'Schema bootstrap is allowed only on an empty isolated database');
  process.env.NODE_ENV = 'development';
} else process.env.NODE_ENV = 'production';
const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.ts');
const payload = await getPayload({ config });
let server;
let checks = 0;
const origin = 'http://127.0.0.1:3097';
const email = `security-regression-${randomBytes(8).toString('hex')}@example.invalid`;
const password = 'Synthetic CMS regression password only 2026';
const content = { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Synthetic security regression content.', detail: 0, format: 0, mode: 'normal', style: '', version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 } };
const expect = (condition, message) => { assert.ok(condition, message); checks++; };
async function api(path, options = {}) {
  const response = await fetch(origin + path, { ...options, headers: { ...(options.body instanceof FormData ? {} : { 'content-type': 'application/json' }), origin: 'https://cms.stor24.co.za', ...options.headers } });
  const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { response, body };
}
try {
  const editor = await payload.create({ collection: 'users', overrideAccess: true, data: { email, password } });
  const user = { ...editor, collection: 'users' };
  // Simulate the documented legacy PBKDF2 record without knowing any real user's password.
  const salt = randomBytes(32).toString('hex');
  const legacyHash = pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex');
  await database.query('UPDATE users SET salt=$1, hash=$2 WHERE id=$3', [salt, legacyHash, editor.id]);
  const fixtures = [];
  for (const collection of ['posts', 'storage-insights']) {
    const base = { title: 'Synthetic publication test', slug: 'security-' + randomBytes(6).toString('hex'), content, pageType: 'pillar', seoTitle: 'Synthetic publication test', metaDescription: 'Synthetic test content only.', primaryKeyword: 'synthetic test', excerpt: 'Synthetic test content only.' };
    const draft = await payload.create({ collection, user, overrideAccess: false, data: { ...base, title: 'PRIVATE SYNTHETIC DRAFT', status: 'draft' } });
    const published = await payload.create({ collection, user, overrideAccess: false, data: { ...base, slug: base.slug + '-published', status: 'published' } });
    const related = collection === 'storage-insights' ? await payload.create({ collection, user, overrideAccess: false, data: { ...base, slug: base.slug + '-related', pageType: 'cluster', relatedPillar: draft.id, status: 'published' } }) : null;
    fixtures.push({ collection, draft, published, related });
  }
  await payload.updateGlobal({ slug: 'micro-warehousing', user, overrideAccess: false, data: { published: false } });
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '0.0.0.0', '--port', '3097'], { env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'ignore', 'inherit'] });
  for (let attempt = 0; attempt < 60; attempt++) {
    // Loopback-only isolated test server; HTTP never carries production credentials.
    // nosemgrep: typescript.react.security.react-insecure-request.react-insecure-request
    try { if ((await fetch(origin + '/admin/login')).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  // Loopback-only health read on the isolated test server.
  // nosemgrep: typescript.react.security.react-insecure-request.react-insecure-request
  expect((await fetch(origin + '/admin/login')).ok, 'CMS login is healthy');
  const login = await api('/api/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  expect(login.response.ok && login.body.token, 'Legacy password authenticates and creates a current session');
  const cookie = login.response.headers.get('set-cookie') || '';
  expect(/;\s*Secure/i.test(cookie) && /;\s*HttpOnly/i.test(cookie) && /;\s*SameSite=Lax/i.test(cookie), 'Production authentication cookie is Secure, HttpOnly and SameSite=Lax');
  const token = login.body.token;
  for (const [method, path] of [['POST', '/api/media'], ['PATCH', '/api/media/1']]) {
    const anonymousFile = new FormData();
    anonymousFile.set('file', new Blob(['not a raster image'], { type: 'image/png' }), 'synthetic-invalid.png');
    const denied = await api(path, { method, body: anonymousFile });
    expect(denied.response.status === 403, `Anonymous ${method} is denied before the invalid image reaches the decoder`);
  }
  const xssPayload = '</script><img src=x onerror="globalThis.xssExecuted=1"><script>globalThis.xssExecuted=1</script>';
  const xssContent = structuredClone(content);
  xssContent.root.children[0].children[0].text = xssPayload;
  const stored = await payload.create({ collection: 'posts', user, overrideAccess: false, data: { title: xssPayload, slug: 'synthetic-xss-' + randomBytes(6).toString('hex'), content: xssContent, status: 'draft' } });
  checks += await verifyCmsXss({ origin, token, cookieName: cookie.split('=')[0], postId: stored.id, payload: xssPayload });
  const maliciousUpload = new FormData();
  maliciousUpload.set('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="1" height="1"/></svg>'], { type: 'image/png' }), 'synthetic-disguised.png');
  const rejectedUpload = await api('/api/media', { method: 'POST', headers: { authorization: `JWT ${token}` }, body: maliciousUpload });
  expect(rejectedUpload.response.status === 400, 'Actual CMS upload endpoint rejects active SVG bytes disguised as PNG');
  const sharp = (await import('sharp')).default;
  for (const format of ['jpeg', 'png', 'webp', 'gif']) {
    const validImage = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ff5a0a' } }).toFormat(format).toBuffer();
    const validUpload = new FormData();
    validUpload.set('file', new Blob([Buffer.concat([validImage, Buffer.from('<script>globalThis.xssExecuted=1</script>')])], { type: `image/${format}` }), `synthetic-valid.${format}`);
    const acceptedUpload = await api('/api/media', { method: 'POST', headers: { authorization: `JWT ${token}` }, body: validUpload });
    expect(acceptedUpload.response.ok, `Actual CMS upload endpoint retains valid ${format} uploads`);
    const uploaded = await api(new URL(acceptedUpload.body.doc.url, origin).pathname);
    expect(uploaded.response.ok && !uploaded.body.includes(Buffer.from('<script>')), `Stored ${format} response excludes appended active content`);
  }
  const upgraded = await database.query('SELECT hash FROM users WHERE id=$1', [editor.id]);
  expect(upgraded.rows[0].hash.startsWith('pbkdf2-sha256-v1:'), 'Legacy password hash upgrades on successful login');
  for (const { collection, draft, published, related } of fixtures) {
    const listed = await api(`/api/${collection}?where[slug][equals]=${draft.slug}&depth=1`);
    expect(listed.response.ok && listed.body.docs.length === 0, `${collection} anonymous list hides drafts`);
    const direct = await api(`/api/${collection}/${draft.id}`);
    expect(direct.response.status === 404, `${collection} anonymous by-ID denies draft`);
    const visible = await api(`/api/${collection}/${published.id}`);
    expect(visible.response.ok && visible.body.id === published.id, `${collection} published document stays public`);
    const privateView = await api(`/api/${collection}/${draft.id}`, { headers: { authorization: `JWT ${token}` } });
    expect(privateView.response.ok && privateView.body.title === draft.title, `${collection} editor retains draft access`);
    if (related) {
      const populated = await api(`/api/${collection}/${related.id}?depth=3`);
      expect(populated.response.ok && !JSON.stringify(populated.body).includes('PRIVATE SYNTHETIC DRAFT'), 'Published relationships cannot populate private draft content');
    }
    const queryName = collection === 'posts' ? 'Posts' : 'StorageInsights';
    const graphql = await api('/api/graphql', { method: 'POST', body: JSON.stringify({ query: `{ ${queryName}(where: { slug: { equals: "${draft.slug}" } }) { docs { id title } } }` }) });
    expect(!graphql.body.errors && graphql.body.data[queryName].docs.length === 0, `${collection} GraphQL cannot reveal drafts`);
  }
  const unpublished = await api('/api/globals/micro-warehousing?select[headline]=true');
  expect(unpublished.response.status === 404, 'Unpublished global denies projected anonymous reads');
  const saved = await api('/api/globals/micro-warehousing', { method: 'POST', headers: { authorization: `JWT ${token}` }, body: JSON.stringify({ published: true }) });
  expect(saved.response.ok, 'Authenticated global publishing persists');
  const projected = await api('/api/globals/micro-warehousing?select[headline]=true');
  expect(projected.response.ok && typeof projected.body.headline === 'string', 'Published global remains readable when projection omits publication flag');
  const globalGraphql = await api('/api/graphql', { method: 'POST', body: JSON.stringify({ query: '{ MicroWarehousing { headline } }' }) });
  expect(!globalGraphql.body.errors && globalGraphql.body.data.MicroWarehousing.headline, 'Published global GraphQL projection remains readable');
  await api('/api/users/logout', { method: 'POST', headers: { authorization: `JWT ${token}` } });
  const revoked = await api(`/api/posts/${fixtures[0].draft.id}`, { headers: { authorization: `JWT ${token}` } });
  expect(revoked.response.status === 404 || revoked.response.status === 401, 'Logged-out session cannot retain draft authority');
  writeFileSync(join(tmpdir(), 'stor24-cms-security-fixtures.json'), JSON.stringify({ email, draftPostId: fixtures[0].draft.id, publishedPostId: fixtures[0].published.id }));
  console.log(JSON.stringify({ checksPassed: checks, database: uri.pathname, providerCalls: 0, customerMutations: 0 }));
} finally {
  server?.kill('SIGTERM');
  await payload.destroy();
  await database.end();
}
process.exit(0);
