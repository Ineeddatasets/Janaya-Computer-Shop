import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Small shared pieces for the storefront: reveal-on-scroll, buttons, pills
 * and section headers. Kept apart from the admin UI kit because the two have
 * different jobs and should be free to drift.
 */

/**
 * True when the element overlaps the viewport by rect alone.
 *
 * A page loaded in a background tab, a minimised window or an off-screen
 * preview reports a zero-height viewport. IntersectionObserver sees nothing
 * intersecting there and may never fire again once the page is shown, which
 * would leave content stuck at opacity zero forever. A viewport with no height
 * therefore counts as visible: better to skip the animation than to hide the
 * page from someone.
 */
function inViewport(node) {
  if (!window.innerHeight) return true
  const rect = node.getBoundingClientRect()
  if (!rect.height && !rect.width) return true
  return rect.top < window.innerHeight && rect.bottom > 0
}

/** Fades a block in the first time it comes near the viewport. */
export function Reveal({ delay = 0, className = '', as: Tag = 'div', children }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    let done = false
    const reveal = () => {
      done = true
      setShown(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && reveal(),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    )
    observer.observe(node)

    // Second chance when the page starts being painted, and a rect-based
    // backstop for anything the observer missed.
    const recheck = () => {
      if (!done && inViewport(node)) reveal()
    }
    document.addEventListener('visibilitychange', recheck)
    const timer = setTimeout(recheck, 1200)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', recheck)
      clearTimeout(timer)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: delay + 'ms' }}
      className={'sf-reveal ' + className}
    >
      {children}
    </Tag>
  )
}

/** Counts up to a number once it is on screen. */
export function CountUp({ value, decimals = 0, duration = 1400 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(value)
      return
    }
    let started = false
    const run = () => {
      if (started) return
      started = true
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1)
        // Ease out so the number settles rather than stopping dead.
        setDisplay(value * (1 - Math.pow(1 - t, 3)))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && run())
    observer.observe(node)

    // Same backstop as Reveal: a figure must never be left reading zero.
    const recheck = () => {
      if (!started && inViewport(node)) run()
    }
    document.addEventListener('visibilitychange', recheck)
    const timer = setTimeout(recheck, 1200)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', recheck)
      clearTimeout(timer)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="sf-num">
      {display.toLocaleString('en-PH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  )
}

const BTN =
  'inline-flex items-center justify-center gap-2 rounded-full text-[0.94rem] font-medium ' +
  'transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'

export function Button({ as = 'button', to, variant = 'solid', className = '', children, ...rest }) {
  const styles = {
    solid: 'bg-[var(--ink)] text-white px-6 py-3 hover:bg-[#26262a] active:scale-[0.985]',
    quiet:
      'bg-white/10 text-white px-5 py-2.5 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/18',
    outline:
      'border border-[var(--line)] px-6 py-3 text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--mist)]',
  }
  const cls = `${BTN} ${styles[variant]} ${className}`

  if (as === 'link') {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (as === 'a') {
    return (
      <a href={to} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

/** The floating status capsule used over the hero. */
export function StatusPill({ children }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full bg-black/55 px-4 py-2.5 text-sm text-white/90 ring-1 ring-white/15 backdrop-blur-md">
      <span className="sf-live-dot h-1.5 w-1.5 rounded-full bg-[var(--live)]" />
      {children}
    </div>
  )
}

export function Eyebrow({ children }) {
  return <p className="sf-eyebrow">{children}</p>
}

/** Standard section opening: eyebrow, headline, one supporting sentence. */
export function SectionHead({ eyebrow, title, lead, align = 'center', className = '' }) {
  const isCentre = align === 'center'
  return (
    <div
      className={
        (isCentre ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl') + ' ' + className
      }
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h2 className="sf-h2 mt-3 text-balance">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={120}>
          <p
            className={
              'sf-lead mt-4 text-pretty text-[var(--ink-2)]' +
              (isCentre ? ' mx-auto max-w-xl' : '')
            }
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  )
}

/** A page band. `tone` picks the paper it sits on. */
export function Section({ tone = 'paper', id, className = '', children }) {
  const bg = tone === 'mist' ? 'bg-[var(--mist)]' : tone === 'ink' ? 'bg-[var(--panel)]' : 'bg-white'
  return (
    <section id={id} className={`${bg} px-5 py-20 sm:px-8 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-[1180px]">{children}</div>
    </section>
  )
}
