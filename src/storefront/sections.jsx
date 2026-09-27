import { useMemo, useState } from 'react'
import { ArrowUpRight, Check, Minus, Plus, Star } from 'lucide-react'
import { CategoryGlyph } from './art.jsx'
import { ProductImage } from './productArt.jsx'
import { Button, CountUp, Eyebrow, Reveal, Section, SectionHead } from './parts.jsx'
import { brands, compare, faqs, range, reviews, stats, steps } from './content.js'

const peso = (n) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(n)

/* ------------------------------------------------------------------ */
/* Brands carried                                                      */
/* ------------------------------------------------------------------ */

export function BrandStrip() {
  return (
    <div className="border-y border-[var(--line)] bg-white py-8">
      <p className="sf-eyebrow mb-6 text-center">Brands we stock and service</p>
      <div className="sf-marquee-mask overflow-hidden">
        <div className="sf-marquee flex w-max gap-14 pr-14">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={brand + i}
              className="text-sm font-semibold tracking-[0.18em] text-[var(--ink-3)] select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* The promise                                                         */
/* ------------------------------------------------------------------ */

export function Promise_() {
  return (
    <Section>
      <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-end">
        <SectionHead
          align="left"
          eyebrow="Why buy here"
          title="A computer chosen properly outlasts a computer bought cheaply."
          lead="Anyone can sell you a box. We ask what you are going to do with it, spec it against that, build it, test it, and stay reachable when something goes wrong three years later."
        />
        <Reveal delay={160} className="md:pb-2">
          <div className="flex flex-wrap gap-3">
            <Button as="a" to="#range">
              See the range
            </Button>
            <Button as="a" to="#visit" variant="outline">
              Visit the shop
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  return (
    <Section tone="mist" id="how">
      <SectionHead
        eyebrow="How it works"
        title="Three steps, one visit."
        lead="Most people walk in undecided and leave with the right machine. This is how that usually goes."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 110}>
            <article className="h-full rounded-[var(--r-md)] border border-[var(--line)] bg-white p-7">
              <span className="sf-num inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-white">
                {step.n}
              </span>
              <h3 className="sf-h3 mt-6">{step.title}</h3>
              <p className="sf-lead mt-2.5 text-[0.98rem] text-[var(--ink-2)]">{step.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* The range: a selectable rail with a live detail panel               */
/* ------------------------------------------------------------------ */

export function Range({ products }) {
  const [active, setActive] = useState(range[0].key)
  const current = range.find((r) => r.key === active) || range[0]

  // The panel reads the real catalogue, so the counts and prices on the
  // marketing page are the same numbers the shop system holds.
  const facts = useMemo(() => {
    const inCategory = products.filter((p) => p.category === current.category)
    if (!inCategory.length) return null
    const prices = inCategory.map((p) => p.price)
    return {
      count: inCategory.length,
      from: Math.min(...prices),
      to: Math.max(...prices),
      available: inCategory.filter((p) => p.stock > 0).length,
      picks: [...inCategory].sort((a, b) => b.price - a.price).slice(0, 3),
    }
  }, [products, current])

  return (
    <Section id="range">
      <SectionHead
        eyebrow="The range"
        title="Everything a working machine needs, on one floor."
        lead="Pick a category to see what we hold and what it costs. These figures come straight from the shop's own stock records."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[300px_1fr]">
        <Reveal>
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {range.map((item) => {
              const on = item.key === active
              return (
                <li key={item.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(item.key)}
                    aria-pressed={on}
                    className={
                      'flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-[0.95rem] transition ' +
                      (on
                        ? 'bg-[var(--ink)] font-medium text-white'
                        : 'text-[var(--ink-2)] hover:bg-[var(--mist)]')
                    }
                  >
                    <span className={'h-6 w-8 shrink-0 ' + (on ? 'text-white' : 'text-[var(--ink-3)]')}>
                      <CategoryGlyph category={item.key} />
                    </span>
                    {item.key}
                  </button>
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal delay={80}>
          <div
            key={active}
            className="sf-reveal overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)]"
            data-shown="true"
          >
            <div className="grid gap-8 p-8 md:grid-cols-[1.15fr_1fr] md:p-10">
              <div>
                <h3 className="sf-h3 text-balance">{current.title}</h3>
                <p className="sf-lead mt-3 text-[0.98rem] text-[var(--ink-2)]">{current.body}</p>

                {facts && (
                  <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--line)] pt-6">
                    <div>
                      <dt className="sf-eyebrow">In the shop</dt>
                      <dd className="sf-num mt-1 text-2xl font-semibold">{facts.count} lines</dd>
                    </div>
                    <div>
                      <dt className="sf-eyebrow">Available now</dt>
                      <dd className="sf-num mt-1 text-2xl font-semibold">{facts.available}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="sf-eyebrow">Price range</dt>
                      <dd className="sf-num mt-1 text-2xl font-semibold">
                        {peso(facts.from)} – {peso(facts.to)}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="rounded-[var(--r-md)] bg-[var(--mist)] p-6">
                <p className="sf-eyebrow">Top of the range</p>
                <ul className="mt-4 space-y-4">
                  {facts?.picks.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-4">
                      <span className="text-[0.92rem] leading-snug text-[var(--ink-2)]">
                        {p.name}
                      </span>
                      <span className="sf-num shrink-0 text-[0.92rem] font-semibold">
                        {peso(p.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* The dearest item in the category, drawn rather than listed. */}
                {facts?.picks[0] && (
                  <div className="mt-6 h-28">
                    <ProductImage product={facts.picks[0]} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Featured builds                                                     */
/* ------------------------------------------------------------------ */

export function Featured({ products }) {
  const picks = useMemo(() => {
    const wanted = ['P-005', 'P-003', 'P-001', 'P-004', 'P-014', 'P-007']
    return wanted.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  }, [products])

  if (!picks.length) return null

  return (
    <Section tone="mist" id="builds">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          align="left"
          eyebrow="On the floor"
          title="Machines people are buying this month."
        />
        <Reveal delay={120}>
          <Button as="link" to="/login" variant="outline">
            Sign in to see your orders <ArrowUpRight size={16} />
          </Button>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((product, i) => (
          <Reveal key={product.id} delay={i * 70}>
            <article className="group flex h-full flex-col overflow-hidden rounded-[var(--r-md)] border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
              <div className="relative flex h-48 items-center justify-center bg-[linear-gradient(145deg,#fbfbfa,#eceae5)] p-6">
                <span className="h-full w-full transition duration-500 group-hover:scale-[1.06]">
                  <ProductImage product={product} />
                </span>
                <span className="absolute top-4 left-4 rounded-full bg-white/80 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--ink-3)] uppercase backdrop-blur">
                  {product.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[1.02rem] leading-snug font-semibold text-balance">
                  {product.name}
                </h3>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <span className="sf-num text-lg font-semibold">{peso(product.price)}</span>
                  <span
                    className={
                      'text-[0.8rem] ' +
                      (product.stock === 0
                        ? 'text-[var(--ink-3)]'
                        : product.stock <= product.reorderPoint
                          ? 'font-medium text-[#9a6a00]'
                          : 'text-[var(--live)]')
                    }
                  >
                    {product.stock === 0
                      ? 'Out of stock'
                      : product.stock <= product.reorderPoint
                        ? 'Only ' + product.stock + ' left'
                        : 'In stock'}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Numbers                                                             */
/* ------------------------------------------------------------------ */

export function Numbers() {
  return (
    <Section tone="ink" className="text-white">
      <SectionHead
        eyebrow="The shop, in numbers"
        title="Eleven years of getting it right the first time."
        className="[&_h2]:text-white [&_p.sf-lead]:text-white/60 [&_.sf-eyebrow]:text-white/40"
        lead="We have been on the same street long enough that people bring us the machines we sold their parents."
      />
      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 90}>
            <div className="border-t border-white/15 pt-6">
              <p className="sf-num text-5xl font-semibold tracking-[-0.04em]">
                <CountUp value={stat.value} decimals={stat.decimals || 0} />
                {stat.suffix}
              </p>
              <p className="mt-3 text-sm font-medium text-white/85">{stat.label}</p>
              <p className="mt-1 text-sm text-white/45">{stat.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

function Cell({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-white">
        <Check size={14} strokeWidth={2.6} />
        <span className="sr-only">Yes</span>
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-3)]">
        <Minus size={14} />
        <span className="sr-only">No</span>
      </span>
    )
  }
  return <span className="text-[0.86rem] text-[var(--ink-2)]">{value}</span>
}

export function Compare() {
  return (
    <Section>
      <SectionHead
        eyebrow="How we compare"
        title="The same machine, bought three ways."
        lead="Parts pricing is roughly the same everywhere. What differs is everything around the parts."
      />
      <Reveal className="mt-14">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="w-[42%] pb-5" />
                {compare.columns.map((col, i) => (
                  <th
                    key={col}
                    className={
                      'pb-5 text-center text-[0.82rem] font-semibold tracking-[0.1em] uppercase ' +
                      (i === 0 ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]')
                    }
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compare.rows.map((row, r) => (
                <tr key={row.label} className={r % 2 ? 'bg-[var(--mist)]' : ''}>
                  <td className="rounded-l-[var(--r-sm)] px-5 py-4 text-[0.95rem] text-[var(--ink-2)]">
                    {row.label}
                  </td>
                  {row.values.map((value, c) => (
                    <td
                      key={c}
                      className={
                        'px-5 py-4 text-center ' +
                        (c === row.values.length - 1 ? 'rounded-r-[var(--r-sm)]' : '')
                      }
                    >
                      <Cell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 pt-7 text-[0.95rem] font-semibold">
                  {compare.footer.label}
                </td>
                {compare.footer.values.map((value, i) => (
                  <td
                    key={i}
                    className={
                      'px-5 pt-7 text-center text-[0.95rem] ' +
                      (i === 0 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]')
                    }
                  >
                    {value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export function Reviews() {
  return (
    <Section tone="mist">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead align="left" eyebrow="From customers" title="People send their friends here." />
        <Reveal delay={100}>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={16} className="fill-[var(--ink)] text-[var(--ink)]" />
              ))}
            </div>
            <span className="sf-num text-sm font-semibold">4.9</span>
            <span className="text-sm text-[var(--ink-3)]">from 312 reviews</span>
          </div>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {reviews.map((review, i) => (
          <Reveal key={review.name} delay={i * 90}>
            <figure className="flex h-full flex-col rounded-[var(--r-md)] bg-white p-7">
              <blockquote className="flex-1 text-[1.02rem] leading-relaxed text-balance">
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-7 border-t border-[var(--line)] pt-5">
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-sm text-[var(--ink-3)]">{review.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export function Questions() {
  const [open, setOpen] = useState(0)

  return (
    <Section id="faq">
      <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr]">
        <SectionHead align="left" eyebrow="Questions" title="Answered plainly." />
        <Reveal>
          <div className="border-t border-[var(--line)]">
            {faqs.map((faq, i) => {
              const isOpen = open === i
              return (
                <div key={faq.q} className="border-b border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-[1.02rem] font-medium text-pretty">{faq.q}</span>
                    <span className="shrink-0 text-[var(--ink-3)]">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="sf-lead pb-6 text-[0.98rem] text-[var(--ink-2)]">{faq.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Visit                                                               */
/* ------------------------------------------------------------------ */

export function Visit() {
  return (
    <Section id="visit" tone="mist">
      <Reveal>
        <div className="overflow-hidden rounded-[var(--r-lg)] bg-[var(--panel)] px-8 py-16 text-center text-white md:px-16 md:py-24">
          <Eyebrow>
            <span className="text-white/45">Come in</span>
          </Eyebrow>
          <h2 className="sf-h2 mx-auto mt-4 max-w-2xl text-balance text-white">
            Bring the work. We will find the machine for it.
          </h2>
          <p className="sf-lead mx-auto mt-5 max-w-lg text-white/60">
            No appointment. Walk in with a budget and a job to do, and leave knowing
            exactly what you are buying and why.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button as="a" to="tel:+639175550143" className="!bg-white !text-[var(--ink)] hover:!bg-white/90">
              Call 0917 555 0143
            </Button>
            <Button as="link" to="/login" variant="quiet">
              Sign in to your account
            </Button>
          </div>

          <dl className="mx-auto mt-16 grid max-w-2xl gap-8 border-t border-white/12 pt-10 text-left sm:grid-cols-3">
            <div>
              <dt className="sf-eyebrow text-white/40">Where</dt>
              <dd className="mt-2 text-sm text-white/85">
                Paseo del Congreso
                <br />
                Malolos, Bulacan
              </dd>
            </div>
            <div>
              <dt className="sf-eyebrow text-white/40">Open</dt>
              <dd className="mt-2 text-sm text-white/85">
                Mon to Sat, 9am to 7pm
                <br />
                Sunday, 10am to 5pm
              </dd>
            </div>
            <div>
              <dt className="sf-eyebrow text-white/40">Service desk</dt>
              <dd className="mt-2 text-sm text-white/85">
                Free diagnosis
                <br />
                Same-day on common faults
              </dd>
            </div>
          </dl>
        </div>
      </Reveal>
    </Section>
  )
}
