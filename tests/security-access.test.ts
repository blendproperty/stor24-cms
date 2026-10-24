import assert from 'node:assert/strict'
import test from 'node:test'
import { authenticated, published } from '../src/access'
import { MicroWarehousing } from '../src/globals/MicroWarehousing'
import { releaseEvidence } from '../scripts/verify-release.mjs'

const request = (user: unknown) => ({ req: { user } }) as Parameters<typeof published>[0]
test('anonymous reads require published content while authenticated editors can read drafts', async () => {
  assert.deepEqual(await published(request(null)), { status: { equals: 'published' } })
  assert.equal(await published(request({ id: 'synthetic-editor' })), true)
  assert.equal(await authenticated(request(null)), false)
  assert.equal(await authenticated(request({ id: 'synthetic-editor' })), true)
})
test('unpublished Micro content is denied across transports; published and authenticated previews remain', async () => {
  const hook = MicroWarehousing.hooks!.afterRead![0]
  const invoke = (published: boolean, user: unknown) => hook({ doc: { published, headline: 'Synthetic content' }, req: { user } } as Parameters<typeof hook>[0])
  assert.throws(() => invoke(false, null), /not published/)
  assert.deepEqual(await invoke(true, null), { published: true, headline: 'Synthetic content' })
  assert.deepEqual(await invoke(false, { id: 'editor' }), { published: false, headline: 'Synthetic content' })
})
test('CMS release evidence rejects absent, wrong-revision, PR-only, failed and superseded checks', () => {
 const sha='a'.repeat(40)
 const run={id:1,run_attempt:1,head_sha:sha,head_branch:'main',event:'push',path:'.github/workflows/security.yml',status:'completed',conclusion:'success'}
 assert.equal(releaseEvidence([run],sha).every(r=>r.ready),true)
 for(const runs of [[],[{...run,head_sha:'b'.repeat(40)}],[{...run,event:'pull_request'}],[{...run,conclusion:'failure'}],[run,{...run,id:2,status:'in_progress',conclusion:null}]]) assert.equal(releaseEvidence(runs,sha).every(r=>r.ready),false)
})
