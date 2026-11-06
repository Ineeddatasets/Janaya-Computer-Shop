import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { Button } from './Primitives.jsx'
import { ProductImage } from '../../storefront/productArt.jsx'
import { fileToCompressedDataUrl, dataUrlSize } from '../../lib/image.js'

/**
 * Picks a photo from the owner's computer for a product.
 *
 * The chosen file is resized and compressed in the browser before it is held
 * in form state, so what reaches the server is already small. When no photo is
 * set, the product falls back to its drawing, and the preview shows that
 * drawing so the owner sees exactly what the shop will display.
 */
export function ImageUpload({ value, art, name, onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(event) {
    const file = event.target.files?.[0]
    // Let the same file be chosen again after a removal.
    event.target.value = ''
    if (!file) return

    setBusy(true)
    setError('')
    try {
      onChange(await fileToCompressedDataUrl(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const isUpload = typeof value === 'string' && value.startsWith('data:')

  return (
    <div>
      <span className="mb-1.5 block text-[0.7rem] font-semibold tracking-[0.12em] text-ink-3 uppercase">
        Photo
      </span>

      <div className="flex items-center gap-4">
        <span className="grid h-20 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-mist p-1.5">
          <ProductImage product={{ image: value || null, art, name: name || 'Product' }} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <ImagePlus size={14} /> {value ? 'Replace photo' : 'Upload photo'}
                </>
              )}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setError('')
                  onChange(null)
                }}
              >
                <Trash2 size={14} /> Remove
              </Button>
            )}
          </div>

          {error ? (
            <p className="mt-2 text-xs text-bad">{error}</p>
          ) : (
            <p className="mt-2 text-xs text-ink-3">
              {isUpload
                ? `Uploaded photo, ${dataUrlSize(value)}. Resized automatically.`
                : value
                  ? 'Using a linked photo. Upload a file to replace it.'
                  : 'No photo yet, so the drawing is shown. JPG, PNG or WebP.'}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick}
      />
    </div>
  )
}
