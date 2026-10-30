import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import pg from 'pg';

// Only a named synthetic staging database and local application processes are supported.
assert.equal(process.env.DB_ROLE_TEST, 'isolated-ci');
assert.ok(process.env.PAYLOAD_SECRET?.startsWith('synthetic-'));
const specs = [['MIGRATION_DATABASE_URL','stage_owner'], ['DATABASE_URI','stage_runtime'], ['PUBLIC_ROLE_URL','stage_tenant_a'], ['EDITOR_ROLE_URL','stage_tenant_b']];
for (const [key, user] of specs) {
  const u = new URL(process.env[key]);
  assert.equal(u.hostname, 'localhost'); assert.equal(u.port, '55481'); assert.equal(u.pathname, '/cms_baseline_replay_ci'); assert.equal(u.username, user); assert.equal(u.search, '');
}
const ownerUrl=process.env.MIGRATION_DATABASE_URL, publicUrl=process.env.PUBLIC_ROLE_URL, editorUrl=process.env.EDITOR_ROLE_URL;
const owner = new pg.Client({connectionString:ownerUrl});
const publicDb = new pg.Client({connectionString:publicUrl});
const editorDb = new pg.Client({connectionString:editorUrl});
const servers=[]; let payload, userId, postIds=[], insightIds=[], microIds=[], enabled=false;
const protectedRelations = [
  ['posts_tags', "EXISTS (SELECT 1 FROM posts p WHERE p.id = posts_tags._parent_id AND p.status = 'published')"],
  ['storage_insights', "status = 'published'"],
  ...['storage_insights_faqs','storage_insights_internal_links','storage_insights_secondary_keywords'].map(table => [table, `EXISTS (SELECT 1 FROM storage_insights p WHERE p.id = ${table}._parent_id AND p.status = 'published')`]),
  ['storage_insights_schema_types', "EXISTS (SELECT 1 FROM storage_insights p WHERE p.id = storage_insights_schema_types.parent_id AND p.status = 'published')"],
  ['micro_warehousing', 'published IS TRUE'],
];
const policyTables=[];
const suffix=randomBytes(8).toString('hex'), publicPolicy=`stage_web_public_${suffix}`, editorPolicy=`stage_web_editor_${suffix}`;
const email=`stage-${suffix}@example.invalid`, password=`Synthetic-${randomBytes(12).toString('hex')}`;
function start(port, database) {
  const env={...process.env, DATABASE_URI:database, NODE_ENV:'production'};
  for (const key of ['MIGRATION_DATABASE_URL','PUBLIC_ROLE_URL','EDITOR_ROLE_URL']) delete env[key];
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env,stdio:'ignore'});
  servers.push(child); return child;
}
async function ready(port, child) {
  for(let i=0;i<100;i++) {
    if(child.exitCode!==null) throw new Error('Synthetic CMS server exited before readiness');
    try { if((await fetch(`http://127.0.0.1:${port}/admin/login`)).ok) return; } catch {}
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  throw new Error('Synthetic CMS server did not become ready');
}
async function request(port,path,options={}) {
  return fetch(`http://127.0.0.1:${port}${path}`,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});
}
try {
  await owner.connect();
  assert.equal((await owner.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.posts'::regclass")).rows[0].relrowsecurity,false);
  process.env.DATABASE_URI=ownerUrl;
  process.env.NODE_ENV='production';
  const {getPayload}=await import('payload');
  const {default:config}=await import('../src/payload.config.ts');
  payload=await getPayload({config});
  const user=await payload.create({collection:'users',overrideAccess:true,data:{email,password}}); userId=user.id;
  for (const status of ['published','draft']) {
    const post=await payload.create({collection:'posts',overrideAccess:true,data:{title:`Synthetic ${status}`,slug:`stage-${status}-${suffix}`,status}});
    postIds.push(post.id);
  }
  await owner.query('INSERT INTO posts_tags (_order,_parent_id,id,tag) VALUES (1,$1,$2,$3),(1,$4,$5,$6)',[postIds[0],`public-${suffix}`,'public',postIds[1],`draft-${suffix}`,'private']);
  insightIds=(await owner.query(`INSERT INTO storage_insights (title,slug,status,seo_title,meta_description,primary_keyword,excerpt,content) VALUES ('Synthetic public',$1,'published','synthetic','synthetic','synthetic','synthetic','{}'),('Synthetic draft',$2,'draft','synthetic','synthetic','synthetic','synthetic','{}') RETURNING id`,[`insight-public-${suffix}`,`insight-draft-${suffix}`])).rows.map(row=>row.id);
  for (const [table, extraColumns, values] of [
    ['storage_insights_faqs', ',question,answer', ", 'synthetic', 'synthetic'"],
    ['storage_insights_internal_links', '', ''],
    ['storage_insights_secondary_keywords', '', ''],
  ]) {
    await owner.query(`INSERT INTO "${table}" (_order,_parent_id,id${extraColumns}) VALUES (1,$1,$2${values}),(1,$3,$4${values})`,[insightIds[0],`a-${table}-${suffix}`,insightIds[1],`b-${table}-${suffix}`]);
  }
  await owner.query('INSERT INTO storage_insights_schema_types ("order",parent_id) VALUES (1,$1),(1,$2)',insightIds);
  microIds=(await owner.query('INSERT INTO micro_warehousing (published,headline) VALUES (true,$1),(false,$2) RETURNING id',[`public-${suffix}`,`draft-${suffix}`])).rows.map(row=>row.id);
  await owner.query('GRANT USAGE ON SCHEMA public TO stage_tenant_a, stage_tenant_b');
  await owner.query('GRANT SELECT ON ALL TABLES IN SCHEMA public TO stage_tenant_a');
  await owner.query('REVOKE SELECT ON users, users_sessions, content_ideas, payload_kv, payload_preferences, payload_preferences_rels, payload_locked_documents, payload_locked_documents_rels FROM stage_tenant_a');
  await owner.query('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO stage_tenant_b');
  await owner.query('GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO stage_tenant_b');
  await owner.query('REVOKE ALL ON payload_migrations FROM stage_tenant_a, stage_tenant_b');
  await publicDb.connect(); await editorDb.connect();
  for (const db of [publicDb, editorDb]) {
    const role=(await db.query("SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,has_schema_privilege(current_user,'public','CREATE') AS schema_create FROM pg_roles WHERE rolname=current_user")).rows[0];
    assert.deepEqual(Object.values(role),[false,false,false,false,false]);
  }
  for (const table of ['users','users_sessions','content_ideas','payload_kv','payload_preferences','payload_preferences_rels','payload_locked_documents','payload_locked_documents_rels']) {
    assert.equal((await publicDb.query('SELECT has_table_privilege(current_user, $1, $2) AS allowed',[table,'SELECT'])).rows[0].allowed,false,`public read denied: ${table}`);
    await assert.rejects(publicDb.query(`SELECT 1 FROM "${table}" LIMIT 1`),error=>error.code==='42501');
  }
  const publicPrivileges=(await publicDb.query("SELECT has_table_privilege(current_user,'posts','SELECT') AS can_read,has_table_privilege(current_user,'posts','INSERT') AS can_insert,has_table_privilege(current_user,'posts','UPDATE') AS can_update,has_table_privilege(current_user,'posts','DELETE') AS can_delete")).rows[0];
  assert.deepEqual(Object.values(publicPrivileges),[true,false,false,false]);
  await owner.query(`CREATE POLICY "${publicPolicy}" ON posts FOR SELECT TO stage_tenant_a USING (status='published')`);
  await owner.query(`CREATE POLICY "${editorPolicy}" ON posts TO stage_tenant_b USING (true) WITH CHECK (true)`);
  await owner.query('ALTER TABLE posts ENABLE ROW LEVEL SECURITY'); enabled=true;
  for (const [table, predicate] of protectedRelations) {
    assert.equal((await owner.query('SELECT relrowsecurity FROM pg_class WHERE oid=$1::regclass',[`public.${table}`])).rows[0].relrowsecurity,false);
    policyTables.push(table);
    await owner.query(`CREATE POLICY "${publicPolicy}" ON "${table}" FOR SELECT TO stage_tenant_a USING (${predicate})`);
    await owner.query(`CREATE POLICY "${editorPolicy}" ON "${table}" TO stage_tenant_b USING (true) WITH CHECK (true)`);
    await owner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
  }

  assert.deepEqual((await publicDb.query('SELECT tag FROM posts_tags WHERE _parent_id=ANY($1::int[]) ORDER BY tag',[postIds])).rows.map(row=>row.tag),['public']);
  assert.equal((await editorDb.query('SELECT tag FROM posts_tags WHERE _parent_id=ANY($1::int[])',[postIds])).rowCount,2);
  assert.deepEqual((await publicDb.query('SELECT id FROM storage_insights WHERE id=ANY($1::int[])',[insightIds])).rows.map(row=>row.id),[insightIds[0]]);
  assert.equal((await editorDb.query('SELECT id FROM storage_insights WHERE id=ANY($1::int[])',[insightIds])).rowCount,2);
  for (const [table, parent] of [['storage_insights_faqs','_parent_id'],['storage_insights_internal_links','_parent_id'],['storage_insights_secondary_keywords','_parent_id'],['storage_insights_schema_types','parent_id']]) {
    assert.equal((await publicDb.query(`SELECT 1 FROM "${table}" WHERE "${parent}"=ANY($1::int[])`,[insightIds])).rowCount,1,`public child rows: ${table}`);
    assert.equal((await editorDb.query(`SELECT 1 FROM "${table}" WHERE "${parent}"=ANY($1::int[])`,[insightIds])).rowCount,2,`editor child rows: ${table}`);
  }
  assert.equal((await publicDb.query('SELECT 1 FROM micro_warehousing WHERE id=ANY($1::int[])',[microIds])).rowCount,1);
  assert.equal((await editorDb.query('SELECT 1 FROM micro_warehousing WHERE id=ANY($1::int[])',[microIds])).rowCount,2);
  const publicServer=start(3098,publicUrl), editorServer=start(3099,editorUrl);
  await Promise.all([ready(3098,publicServer),ready(3099,editorServer)]);
  assert.equal((await request(3098,`/api/posts/${postIds[0]}`)).status,200,'published content is public');
  assert.equal((await request(3098,`/api/posts/${postIds[1]}`)).status,404,'anonymous public process cannot read draft');
  assert.equal((await request(3099,`/api/posts/${postIds[1]}`)).status,404,'anonymous editor process remains restricted by Payload');
  const login=await request(3099,'/api/users/login',{method:'POST',body:JSON.stringify({email,password})});
  assert.equal(login.status,200,'synthetic editor logs in on editor role');
  const token=(await login.json()).token; assert.ok(token);
  const auth={authorization:`JWT ${token}`};
  assert.equal((await request(3099,`/api/posts/${postIds[1]}`,{headers:auth})).status,200,'authenticated editor can read draft');
  assert.equal((await request(3098,`/api/posts/${postIds[1]}`,{headers:auth})).status,404,'public database identity denies draft even to authenticated editor');
  const publicLogin=await request(3098,'/api/users/login',{method:'POST',body:JSON.stringify({email,password})});
  assert.ok(!publicLogin.ok,'public database identity cannot authenticate an editor');
  const denied=await request(3098,`/api/posts/${postIds[1]}`,{method:'PATCH',headers:auth,body:JSON.stringify({title:'forged'})});
  assert.ok(!denied.ok,'public database identity cannot change draft');
  const after=await request(3099,`/api/posts/${postIds[1]}`,{headers:auth});
  assert.equal((await after.json()).title,'Synthetic draft','denied change did not persist');
  const edited=await request(3099,`/api/posts/${postIds[1]}`,{method:'PATCH',headers:auth,body:JSON.stringify({title:'Synthetic editor update'})});
  assert.equal(edited.status,200,'authenticated editor can update a draft through the editor role');
  const reread=await request(3099,`/api/posts/${postIds[1]}`,{headers:auth});
  assert.equal((await reread.json()).title,'Synthetic editor update');
  assert.equal((await request(3098,`/api/posts/${postIds[1]}`,{headers:auth})).status,404,'the updated draft remains hidden through the public role');
  console.log(JSON.stringify({cmsRoleRlsHttpRehearsal:'passed', privateTablesDenied:8, additionalRlsTables:7,scope:'synthetic local databases and separate test servers only',productionIntegrated:false}));
} finally {
  for(const child of servers) child.kill('SIGTERM');
  await Promise.all(servers.map(child=>new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(resolve,5000).unref();})));
  for (const table of policyTables) {
    await owner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
    await owner.query(`DROP POLICY IF EXISTS "${publicPolicy}" ON "${table}"`);
    await owner.query(`DROP POLICY IF EXISTS "${editorPolicy}" ON "${table}"`);
  }
  if(enabled) await owner.query('ALTER TABLE posts DISABLE ROW LEVEL SECURITY');
  await owner.query(`DROP POLICY IF EXISTS "${publicPolicy}" ON posts`).catch(()=>{});
  await owner.query(`DROP POLICY IF EXISTS "${editorPolicy}" ON posts`).catch(()=>{});
  await owner.query('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM stage_tenant_a, stage_tenant_b').catch(()=>{});
  await owner.query('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM stage_tenant_a, stage_tenant_b').catch(()=>{});
  await owner.query('REVOKE USAGE ON SCHEMA public FROM stage_tenant_a, stage_tenant_b').catch(()=>{});
  if(postIds.length) await owner.query('DELETE FROM posts WHERE id=ANY($1::int[])',[postIds]);
  if(insightIds.length) await owner.query('DELETE FROM storage_insights WHERE id=ANY($1::int[])',[insightIds]);
  if(microIds.length) await owner.query('DELETE FROM micro_warehousing WHERE id=ANY($1::int[])',[microIds]);
  if(userId) await owner.query('DELETE FROM users WHERE id=$1',[userId]);
  await payload?.destroy(); await publicDb.end().catch(()=>{}); await editorDb.end().catch(()=>{}); await owner.end().catch(()=>{});
}
process.exit(0);
