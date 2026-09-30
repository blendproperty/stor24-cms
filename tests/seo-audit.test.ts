import test from 'node:test'
import assert from 'node:assert/strict'
import { auditDocument } from '../src/lib/seo-audit'
test('empty drafts report missing metadata, body and address', () => {
 const result = auditDocument({}); assert.equal(result.words,0); assert.equal(result.issues.length,5)
})
test('article check uses plugin fields and recognises body links', () => {
 const result = auditDocument({title:'Heading',slug:'example',meta:{title:'Search title',description:'Useful description'},content:{root:{children:[{text:'Useful content'},{type:'link',fields:{url:'/storage/midpoint'}}]}}}); assert.equal(result.issues.length,0); assert.equal(result.title,'Search title')
})
test('guide uses dedicated SEO fields and flags topic mismatch', () => {
 const result = auditDocument({title:'Moving',slug:'moving',seoTitle:'Moving advice',metaDescription:'Plan your move',primaryKeyword:'business storage',content:{root:{children:[{text:'Plan carefully'}]}}},true); assert.ok(result.issues.some(issue=>issue.includes('target topic')))
})
test('external lookalike URLs are not counted as internal links', () => {
 const result = auditDocument({content:{root:{children:[{type:'link',fields:{url:'https://stor24.co.za.evil.test/'}}]}}}); assert.ok(result.issues.some(issue=>issue.includes('Link naturally')))
})
