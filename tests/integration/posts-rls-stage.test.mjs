import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

// This test applies temporary policies only to the named disposable database.
test('role-bound policies distinguish public and editor access to actual CMS posts', async () => {
  assert.equal(process.env.DB_ROLE_TEST, 'isolated-ci');
  const specs = [['MIGRATION_DATABASE_URL','stage_owner'], ['DATABASE_URI','stage_runtime'], ['PUBLIC_ROLE_URL','stage_tenant_a'], ['EDITOR_ROLE_URL','stage_tenant_b']];
  const clients = [];
  for (const [key, user] of specs) {
    const u = new URL(process.env[key]);
    assert.equal(u.hostname, 'localhost'); assert.equal(u.port, '55481');
    assert.equal(u.pathname, '/cms_baseline_replay_ci'); assert.equal(u.username, user);
    clients.push(new pg.Client({ connectionString: u.toString() }));
  }
  const [owner, runtime, publicRole, editor] = clients;
  const suffix = randomUUID().replaceAll('-', ''), publicPolicy=`stage_public_${suffix}`, editorPolicy=`stage_editor_${suffix}`;
  let ids=[], enabled=false;
  try {
    for (const c of clients) await c.connect();
    assert.equal((await owner.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.posts'::regclass")).rows[0].relrowsecurity, false);
    ids=(await owner.query(`INSERT INTO posts (title,slug,status) VALUES ($1,$2,'published'),($3,$4,'draft') RETURNING id`, ['Synthetic published',`published-${suffix}`,'Synthetic draft',`draft-${suffix}`])).rows.map(r=>r.id);
    await owner.query('GRANT USAGE ON SCHEMA public TO stage_tenant_a, stage_tenant_b');
    await owner.query('GRANT SELECT ON posts TO stage_tenant_a');
    await owner.query('GRANT SELECT,INSERT,UPDATE,DELETE ON posts TO stage_tenant_b');
    await owner.query(`CREATE POLICY "${publicPolicy}" ON posts FOR SELECT TO stage_tenant_a USING (status='published')`);
    await owner.query(`CREATE POLICY "${editorPolicy}" ON posts TO stage_tenant_b USING (true) WITH CHECK (true)`);
    await owner.query('ALTER TABLE posts ENABLE ROW LEVEL SECURITY'); enabled=true;
    assert.deepEqual((await publicRole.query('SELECT id FROM posts WHERE id=ANY($1::int[]) ORDER BY id',[ids])).rows.map(r=>r.id),[ids[0]]);
    assert.equal((await editor.query('SELECT id FROM posts WHERE id=ANY($1::int[])',[ids])).rowCount,2);
    assert.equal((await runtime.query('SELECT id FROM posts WHERE id=ANY($1::int[])',[ids])).rowCount,0, 'shared runtime fails closed without a policy');
    await assert.rejects(publicRole.query('UPDATE posts SET title=$1 WHERE id=$2',['forged',ids[1]]),e=>e.code==='42501');
    assert.equal((await editor.query('UPDATE posts SET title=$1 WHERE id=$2',['Synthetic edit',ids[1]])).rowCount,1);
    await publicRole.query("SELECT set_config('app.editor','true',false)");
    assert.deepEqual((await publicRole.query('SELECT id FROM posts WHERE id=ANY($1::int[]) ORDER BY id',[ids])).rows.map(r=>r.id),[ids[0]]);
    await assert.rejects(publicRole.query('SET ROLE stage_tenant_b'),e=>e.code==='42501');
    await assert.rejects(runtime.query('SET ROLE stage_tenant_b'),e=>e.code==='42501');
  } finally {
    if (enabled) await owner.query('ALTER TABLE posts DISABLE ROW LEVEL SECURITY');
    await owner.query(`DROP POLICY IF EXISTS "${publicPolicy}" ON posts`).catch(()=>{});
    await owner.query(`DROP POLICY IF EXISTS "${editorPolicy}" ON posts`).catch(()=>{});
    await owner.query('REVOKE SELECT ON posts FROM stage_tenant_a').catch(()=>{});
    await owner.query('REVOKE SELECT,INSERT,UPDATE,DELETE ON posts FROM stage_tenant_b').catch(()=>{});
    if (ids.length) await owner.query('DELETE FROM posts WHERE id=ANY($1::int[])',[ids]);
    for (const c of clients) await c.end().catch(()=>{});
  }
});
