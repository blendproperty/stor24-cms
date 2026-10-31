import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

export async function verifyEditorSeoHttp({ api, token, expect, publishedPostSlug }) {
  const auth = { authorization: `JWT ${token}` };
  const save = (path, data, method = 'POST', headers = auth) => api(path, { method, headers, body: JSON.stringify(data) });
  expect((await save('/api/page-seo', {path:'/personal-storage'}, 'POST', {})).response.status === 403, 'Anonymous visitors cannot create fixed-page SEO settings');
  const prior = await api('/api/page-seo?where[path][equals]=%2Fpersonal-storage', {headers:auth});
  const previous = prior.body.docs?.[0];
  if(previous) assert.equal(previous.seoTitle,'Synthetic editable search title','Only this guarded fixture may be reused after restore');
  const draft = await save(previous ? `/api/page-seo/${previous.id}` : '/api/page-seo', { path:'/personal-storage', seoTitle:'Synthetic editable search title', metaDescription:'Synthetic saved description.', ogTitle:'Synthetic social title', noIndex:false, canonicalPath:null, status:'draft' }, previous?'PATCH':'POST');
  expect(draft.response.ok, 'Editor can save fixed-page SEO draft'); const id=draft.body.doc.id;
  expect((await api(`/api/page-seo/${id}`)).response.status === 404, 'Anonymous visitors cannot read fixed-page SEO drafts');
  const excluded = await save(`/api/page-seo/${id}`, { status:'published', noIndex:true }, 'PATCH');
  expect(excluded.response.ok && excluded.body.doc.noIndex === true, 'Editor can publish a fixed-page search exclusion');
  const publicRead=await api(`/api/page-seo/${id}`);expect(publicRead.response.ok && publicRead.body.ogTitle === 'Synthetic social title', 'Published fixed-page metadata remains public by intended transport');
  const badCanonical=await save(`/api/page-seo/${id}`, {canonicalPath:'/business-storage'}, 'PATCH');expect(badCanonical.response.status===400, 'Conflicting exclusion and alternate canonical are rejected');
  const canonical=await save(`/api/page-seo/${id}`, {noIndex:false,canonicalPath:'/business-storage'}, 'PATCH');expect(canonical.response.ok, 'Editor can choose an approved same-site canonical');
  expect((await save('/api/page-seo',{path:'/business-storage',noIndex:true,status:'published'})).response.status===400, 'A canonical target cannot be excluded while another page points at it');
  expect((await save(`/api/page-seo/${id}`,{canonicalPath:'https://evil.example/'},'PATCH')).response.status===400, 'External canonical values cannot be published');
  expect((await save('/api/redirects',{source:'/old',destination:'/'},'POST',{})).response.status===403,'Anonymous visitors cannot create redirects');
  for(const data of [{source:'/book',destination:'/'},{source:'/api/private',destination:'/'},{source:'/unsafe',destination:'https://evil.example/'},{source:'/with-query?token=private',destination:'/'},{source:`/blog/${publishedPostSlug}`,destination:'/business-storage'}]) expect((await save('/api/redirects',{...data,status:'published'})).response.status===400,'Protected, external, query-bearing and active-content redirect sources are rejected');
  const suffix=randomBytes(6).toString('hex'), oldA=`/retired-editor-${suffix}-a`, oldB=`/retired-editor-${suffix}-b`, contentSlug=`synthetic-reserved-${suffix}`;
  const first=await save('/api/redirects',{source:oldA,destination:oldB,statusCode:308,status:'draft'});expect(first.response.ok,'Editor can save a redirect draft');
  expect((await api(`/api/redirects/${first.body.doc.id}`)).response.status===404,'Redirect drafts are not public');
  expect((await save(`/api/redirects/${first.body.doc.id}`,{status:'published'},'PATCH')).response.ok,'Editor can publish a reviewed redirect');
  expect((await save('/api/redirects',{source:oldB,destination:oldA,statusCode:307,status:'published'})).response.status===400,'Published redirect cycle is rejected');
  expect((await api(`/api/redirects/${first.body.doc.id}`)).response.ok,'Published redirects are publicly readable');
  const contentPath=await save('/api/redirects',{source:`/blog/${contentSlug}`,destination:'/business-storage',status:'published'});expect(contentPath.response.ok,'A retired article address can be reserved by a redirect');
  const reclaimedPost=await save('/api/posts',{title:'Synthetic reclaimed article',slug:contentSlug,status:'published'});expect(reclaimedPost.response.ok,'Existing article publication remains intact; the public website gives published content priority');
  expect((await save(`/api/redirects/${contentPath.body.doc.id}`,{status:'draft'},'PATCH')).response.ok,'Editor can retire a redirect');
  const restoredPost=await save(`/api/posts/${reclaimedPost.body.doc.id}`,{title:'Synthetic restored article'},'PATCH');expect(restoredPost.response.ok,'Retiring a redirect preserves normal article editing');
  assert.ok(id);
  return { id };
}
