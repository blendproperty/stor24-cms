import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'
import { safeCmsImage } from '../src/media-security'

test('CMS rejects active HTML/SVG content even when submitted as a PNG', async () => {
  for (const content of ['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="1" height="1"/></svg>', '<!doctype html><script>alert(1)</script>', 'invalid image']) {
    await assert.rejects(safeCmsImage(Buffer.from(content)), /Upload a valid/)
  }
})

test('CMS retains supported raster formats and strips appended active content', async () => {
  for (const format of ['jpeg', 'png', 'webp', 'gif'] as const) {
    const original = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ff5a0a' } }).toFormat(format).toBuffer()
    const result = await safeCmsImage(Buffer.concat([original, Buffer.from('<script>alert(1)</script>')]))
    assert.equal(result.format, format)
    assert.equal((await sharp(result.buffer).metadata()).width, 2)
    assert.ok(!result.buffer.includes(Buffer.from('<script>')))
  }
  const frames = await Promise.all(['#ff5a0a', '#071411'].map(background => sharp({ create: { width: 2, height: 2, channels: 3, background } }).png().toBuffer()))
  const animated = await sharp(frames, { join: { animated: true } }).gif({ delay: [100, 200], loop: 0 }).toBuffer()
  const result = await safeCmsImage(animated)
  assert.equal((await sharp(result.buffer, { animated: true }).metadata()).pages, 2)
  const oriented = await sharp({ create: { width: 2, height: 3, channels: 3, background: '#ff5a0a' } }).jpeg().withMetadata({ orientation: 6 }).toBuffer()
  const upright = await safeCmsImage(oriented)
  const metadata = await sharp(upright.buffer).metadata()
  assert.equal(metadata.width, 3)
  assert.equal(metadata.height, 2)
})
