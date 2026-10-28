import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const require = createRequire(import.meta.url);
const merge = require('../vendor/deepmerge');
const attack = () => JSON.parse('{"__proto__":{"inheritedAdmin":true},"normal":1}');
const safe = result => {
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(result.inheritedAdmin, undefined);
  assert.equal({}.inheritedAdmin, undefined);
};

test('lock and override select the tracked patched implementation without a registry fallback', () => {
  const root = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
  const vendor = require('../vendor/deepmerge/package.json');
  assert.equal(root.dependencies.deepmerge, 'file:vendor/deepmerge');
  assert.equal(root.overrides.deepmerge, '$deepmerge');
  assert.equal(vendor.version, '4.3.1-stor24.1');
  assert.equal(vendor.private, true);
  assert.deepEqual(lock.packages['node_modules/deepmerge'], { resolved: 'vendor/deepmerge', link: true });
  assert.equal(lock.packages['vendor/deepmerge'].version, vendor.version);
  assert.deepEqual(Object.keys(lock.packages).filter(k => /(?:^|\/)node_modules\/deepmerge$/.test(k)), ['node_modules/deepmerge']);
});

test('null-prototype and own-proto target/source loops cannot poison a newly merged object', () => {
  for (const [target, source] of [[Object.create(null), attack()], [attack(), {}], [attack(), attack()]]) {
    const result = merge(target, source);
    safe(result);
    assert.equal(result.normal, 1);
  }
});

for (const placeholder of [null, undefined, 0, false, '']) {
  test(`nested ${String(placeholder)} placeholder rejects proto while retaining ordinary data`, () => {
    const result = merge({ session: placeholder }, { session: attack() });
    safe(result.session);
    assert.equal(result.session.normal, 1);
    assert.equal(result.session.hasOwnProperty('normal'), true);
  });
}

test('arrays and all do not reintroduce target-copy or nested prototype poisoning', () => {
  const result = merge({ items: [{ session: null }] }, { items: [{ session: attack() }] });
  result.items.forEach(item => { if (item.session) safe(item.session); });
  safe(merge.all([attack(), { session: null }, { session: attack() }]).session);
  safe(merge.all([attack(), {}]));
});

test('ordinary deep merges, symbols and legitimate constructor/prototype data remain compatible', () => {
  const symbol = Symbol('own-enumerable');
  const result = merge({ constructor: { previous: 1 }, prototype: { previous: 1 }, list: [1], [symbol]: { a: 1 } },
    { constructor: { next: 2 }, prototype: { next: 2 }, list: [2], [symbol]: { b: 2 } });
  assert.deepEqual(result.constructor, { previous: 1, next: 2 });
  assert.deepEqual(result.prototype, { previous: 1, next: 2 });
  assert.deepEqual(result.list, [1, 2]);
  assert.deepEqual(result[symbol], { a: 1, b: 2 });
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
});

test('clone false, custom merge, mergeability and array callbacks retain their API', () => {
  const source = { nested: { value: 1 } };
  assert.equal(merge({}, source, { clone: false }).nested, source.nested);
  assert.deepEqual(merge({ name: 'old' }, { name: 'new' }, {
    isMergeableObject: value => typeof value === 'string',
    customMerge: key => key === 'name' ? (a, b) => a + b : undefined,
  }), { name: 'oldnew' });
  const replacement = [3];
  assert.equal(merge([1], replacement, { arrayMerge: (_, right) => right }), replacement);
  let helperCalled = false;
  assert.deepEqual(merge([], [{ a: 1 }], { arrayMerge: (_, right, options) => {
    helperCalled = true;
    return right.map(value => options.cloneUnlessOtherwiseSpecified(value, options));
  } }), [{ a: 1 }]);
  assert.equal(helperCalled, true);
  const date = new Date(0);
  assert.equal(merge({}, { date }).date, date);
  assert.throws(() => merge.all({}), /first argument should be an array/);
});
