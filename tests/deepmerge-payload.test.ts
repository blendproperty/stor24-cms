import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { deepMerge, deepMergeWithCombinedArrays, deepMergeWithReactComponents, deepMergeWithSourceArrays } from 'payload/shared'

test('the installed Payload resolves the patched tracked dependency', () => {
  const require = createRequire(import.meta.url)
  const payloadRequire = createRequire(require.resolve('payload'))
  assert.equal(realpathSync(payloadRequire.resolve('deepmerge')), realpathSync(fileURLToPath(new URL('../vendor/deepmerge/dist/cjs.js', import.meta.url))))
})

test('actual Payload wrappers reject inherited poison and retain ordinary merged data', () => {
  const wrappers: Array<(left: object, right: object) => object> = [deepMerge, deepMergeWithCombinedArrays, deepMergeWithReactComponents, deepMergeWithSourceArrays]
  for (const merge of wrappers) {
    const result = merge({ session: null }, JSON.parse('{"session":{"__proto__":{"inheritedAdmin":true},"normal":1}}')) as { session: Record<string, unknown> }
    assert.equal(Object.getPrototypeOf(result.session), Object.prototype)
    assert.equal(result.session.inheritedAdmin, undefined)
    assert.equal(result.session.normal, 1)
    assert.equal(({} as Record<string, unknown>).inheritedAdmin, undefined)
  }
  assert.deepEqual(deepMergeWithCombinedArrays({ list: [{ a: 1 }] }, { list: [{ b: 2 }] }), { list: [{ a: 1, b: 2 }] })
  const source = [2]
  assert.equal(deepMergeWithSourceArrays<{ list: number[] }>({ list: [1] }, { list: source }).list, source)
})
