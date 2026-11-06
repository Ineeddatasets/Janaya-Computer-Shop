/**
 * Turning a photo from the owner's computer into something small enough to
 * store.
 *
 * The database is the only durable place to keep an uploaded picture: the
 * host's filesystem is wiped on every restart and redeploy, so a file written
 * to disk would vanish. That makes size the binding constraint, and the cheapest
 * place to solve it is here, in the browser, before a single byte is uploaded.
 *
 * A phone photo is typically 3-6 MB. Redrawn at 640px on its longest edge and
 * encoded as JPEG, the same picture lands around 40-60 KB, which is far more
 * than enough for a product thumbnail.
 */

/** Longest edge, in pixels, of a stored product photo. */
const MAX_EDGE = 640

/** Encoded size we refuse to exceed, as a data URL string. */
export const MAX_IMAGE_BYTES = 200 * 1024

/** Quality steps tried in order until the result fits under the cap. */
const QUALITY_STEPS = [0.75, 0.65, 0.55, 0.45]

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Decodes a file to a bitmap, honouring the EXIF orientation that phone
 * cameras write, so portrait photos do not arrive on their side.
 */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Older Safari rejects the options argument; fall through to <img>.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('That file could not be read as an image.'))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Reads an image file and returns a compressed JPEG data URL, or throws an
 * Error whose message is safe to show the user.
 */
export async function fileToCompressedDataUrl(file) {
  if (!file) throw new Error('No file chosen.')
  if (!file.type.startsWith('image/')) {
    throw new Error('That is not an image. Choose a JPG, PNG or WebP file.')
  }
  // A sanity ceiling on the *input*, so we never try to decode a 100 MB file.
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('That image is over 25 MB. Please choose a smaller one.')
  }

  const source = await decode(file)
  const width = source.width
  const height = source.height
  if (!width || !height) throw new Error('That image appears to be empty.')

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))

  const ctx = canvas.getContext('2d')
  // A white floor, so a transparent PNG does not become a black rectangle
  // once it is flattened into JPEG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  source.close?.()

  for (const quality of QUALITY_STEPS) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrl.length <= MAX_IMAGE_BYTES) return dataUrl
  }

  throw new Error('That image is too detailed to store. Try a simpler photo.')
}

/** Human-readable size of a data URL, for the hint under the preview. */
export function dataUrlSize(dataUrl) {
  if (!dataUrl) return ''
  const kb = dataUrl.length / 1024
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`
}
