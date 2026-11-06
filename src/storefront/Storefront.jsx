import { useEffect, useState } from 'react'
import * as api from '../data/api.js'
import { HeroScene } from './art.jsx'
import { Button, Reveal, StatusPill } from './parts.jsx'
import { Nav, Footer } from './chrome.jsx'
import {
  BrandStrip,
  Compare,
  Featured,
  HowItWorks,
  Numbers,
  Promise_,
  Questions,
  Range,
  Reviews,
  Visit,
} from './sections.jsx'
import './storefront.css'

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ liveCount, status }) {
  return (
    <div className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative isolate overflow-hidden rounded-[var(--r-lg)] bg-[var(--panel)]">
        <HeroScene className="absolute inset-0 h-full w-full object-cover" />
        {/* Two scrims: a vertical wash for the whole panel, and a soft centre
            pool so the headline always has a dark field behind it. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_44%,rgba(0,0,0,0.62),transparent_70%)]" />

        <div className="relative flex min-h-[86svh] flex-col items-center justify-center px-5 pt-28 pb-10 text-center sm:min-h-[88svh]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[0.78rem] font-medium text-white/85 ring-1 ring-white/15 backdrop-blur-md">
              Free setup and data transfer on every machine
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="sf-display mt-7 max-w-4xl text-balance text-white">
              Built for the work
              <br />
              you actually do.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="sf-lead mt-7 max-w-xl text-balance text-white/80">
              Laptops, desktops and parts, specified by people who ask what the machine
              is for before they sell you one. Assembled and tested in Malolos.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                as="a"
                to="#range"
                className="!bg-white !px-7 !py-3.5 !text-[var(--ink)] hover:!bg-white/90"
              >
                See what we carry
              </Button>
              <Button as="a" to="#how" variant="quiet" className="!px-7 !py-3.5">
                How it works
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex justify-center px-5">
          <Reveal delay={340}>
            <StatusPill>
              {status === 'waking'
                ? 'Waking the shop up, one moment…'
                : liveCount
                ? liveCount + ' machines and parts in stock today'
                : 'Open today until 7pm'}
            </StatusPill>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function Storefront() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')

  // The storefront reads the catalogue directly rather than through
  // ShopContext, because it is a public page with no signed-in session.
  //
  // The retry matters more than it looks. On a free host the server sleeps
  // when idle and takes most of a minute to wake, so the very first request a
  // visitor makes can fail. Without this the catalogue silently stayed empty
  // and the shop looked like it had no stock.
  useEffect(() => {
    let cancelled = false
    const waits = [1000, 2000, 4000, 8000, 12000]

    async function load() {
      for (let attempt = 0; attempt <= waits.length; attempt++) {
        try {
          const rows = await api.listProducts()
          if (cancelled) return
          setProducts(rows)
          setStatus('ready')
          return
        } catch {
          if (cancelled) return
          if (attempt === waits.length) {
            setStatus('failed')
            return
          }
          setStatus('waking')
          await new Promise((r) => setTimeout(r, waits[attempt]))
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const inStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div className="sf">
      <Nav />
      <main>
        {status === 'failed' && (
          <div className="bg-[var(--ink)] px-5 py-3 text-center text-sm text-white">
            The catalogue could not be loaded just now.{' '}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
        <Hero liveCount={inStock} status={status} />
        <BrandStrip />
        <Promise_ />
        <HowItWorks />
        <Range products={products} />
        <Featured products={products} />
        <Numbers />
        <Compare />
        <Reviews />
        <Questions />
        <Visit />
      </main>
      <Footer />
    </div>
  )
}
