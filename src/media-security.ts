import sharp from 'sharp'
import { APIError, type CollectionBeforeOperationHook } from 'payload'

export async function safeCmsImage(data: Buffer) {
  try {
    const image = sharp(data, { animated: true, failOn: 'error', limitInputPixels: 40_000_000 })
    const metadata = await image.metadata()
    if (!metadata.format || !['jpeg', 'png', 'webp', 'gif'].includes(metadata.format)) throw new Error('UNSUPPORTED_IMAGE')
    // Decode/re-encode raster pixels, removing appended HTML/SVG and executable metadata.
    const buffer = await image.rotate().toFormat(metadata.format).toBuffer()
    return { buffer, format: metadata.format, mime: `image/${metadata.format}` }
  } catch {
    throw new APIError('Upload a valid JPEG, PNG, WebP or GIF image.', 400)
  }
}

export const protectMediaUpload: CollectionBeforeOperationHook = async ({ args, operation, req, overrideAccess }) => {
  // Payload checks collection access after this hook; do not decode denied uploads.
  if (!req.user && !overrideAccess) return args
  if ((operation === 'create' || operation === 'update') && req.file) {
    const image = await safeCmsImage(req.file.data)
    req.file.data = image.buffer
    req.file.size = image.buffer.length
    req.file.mimetype = image.mime
    req.file.name = req.file.name.replace(/\.[^.]+$/, '') + '.' + (image.format === 'jpeg' ? 'jpg' : image.format)
  }
  return args
}
