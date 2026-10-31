import test from 'node:test'
import assert from 'node:assert/strict'
import { searchIndexing } from '../src/fields/search-indexing'
import { editorialCollection } from '../src/admin/editorial'
import { StorageInsights } from '../src/collections/StorageInsights'
import { auditDocument } from '../src/lib/seo-audit'
import type { Field } from 'payload'

const flatten = (fields: Field[]): Field[] => fields.flatMap(field => 'fields' in field ? [field, ...flatten(field.fields)] : [field])

test('search exclusion defaults off and survives the article and guide editor layouts', () => {
  assert.equal(searchIndexing.defaultValue, false)
  const article = editorialCollection({slug:'posts', fields:[searchIndexing, {name:'title',type:'text'}]})
  const guide = editorialCollection({...StorageInsights, fields:[...StorageInsights.fields]})
  for (const collection of [article, guide]) {
    const fields = flatten(collection.fields).filter(field => 'name' in field && field.name === 'noIndex')
    assert.equal(fields.length, 1)
    assert.equal(fields[0].admin?.position, 'sidebar')
  }
})

test('SEO review makes a saved editor search exclusion visible', () => {
  assert.ok(auditDocument({noIndex:true}).issues.some(issue => issue.startsWith('Excluded from search results')))
  assert.ok(!auditDocument({noIndex:false}).issues.some(issue => issue.startsWith('Excluded from search results')))
})
