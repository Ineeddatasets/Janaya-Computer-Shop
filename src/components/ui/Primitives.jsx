/**
 * The staff UI kit, drawn in the same language as the storefront: white cards
 * on a warm off-white page, hairline rules, pill buttons, near-black ink and
 * status colour only where it means something.
 */

/* ---------------------------------------------------------------- */
/* Buttons                                                            */
/* ---------------------------------------------------------------- */

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45'

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4.5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
}

const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-ink-2 focus-visible:outline-ink active:scale-[0.985]',
  outline:
    'border border-line bg-white text-ink hover:border-ink hover:bg-mist focus-visible:outline-ink',
  subtle: 'bg-mist text-ink-2 hover:bg-line hover:text-ink focus-visible:outline-ink',
  ghost: 'text-ink-3 hover:bg-mist hover:text-ink focus-visible:outline-ink',
  danger: 'bg-bad text-white hover:brightness-110 focus-visible:outline-bad',
}

// `tone` is swallowed rather than used: pages still name their module, but the
// palette is monochrome now, and letting it through would land on the DOM.
export function Button({ variant = 'primary', size = 'md', tone, className = '', ...props }) {
  return <button className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`} {...props} />
}

/* ---------------------------------------------------------------- */
/* Form fields                                                        */
/* ---------------------------------------------------------------- */

const FIELD =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-3/70 focus:border-ink focus:ring-2 focus:ring-ink/10 focus:outline-none ' +
  'disabled:bg-mist disabled:text-ink-3'

export function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[0.7rem] font-semibold tracking-[0.12em] text-ink-3 uppercase">
          {label}
          {required && <span className="ml-0.5 text-bad">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-bad">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-3">{hint}</span>
      ) : null}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${FIELD} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${FIELD} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea rows={3} className={`${FIELD} ${className}`} {...props} />
}

/* ---------------------------------------------------------------- */
/* Surfaces                                                           */
/* ---------------------------------------------------------------- */

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-card border border-line bg-white ${className}`}>{children}</div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
      <div>
        <h2 className="text-[0.95rem] font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** The page banner. Monochrome now: the icon marks the module, not a colour. */
export function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h1 className="text-[1.4rem] font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

/** A segmented control, used where pages had coloured tab bars. */
export function Tabs({ value, onChange, options, className = '' }) {
  return (
    <div className={`flex rounded-full border border-line bg-white p-1 ${className}`}>
      {options.map((option) => {
        const key = option.value ?? option
        const label = option.label ?? option
        const on = key === value
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={on}
            className={
              'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ' +
              (on ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink')
            }
          >
            {option.icon && <option.icon size={15} />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Small pieces                                                       */
/* ---------------------------------------------------------------- */

const BADGE_TONES = {
  neutral: 'bg-mist text-ink-2',
  green: 'bg-good/12 text-good',
  amber: 'bg-warn/12 text-warn',
  red: 'bg-bad/12 text-bad',
  blue: 'bg-mist text-ink-2',
  purple: 'bg-mist text-ink-2',
  teal: 'bg-mist text-ink-2',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function StatTile({ icon: Icon, label, value, note }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-ink-3 uppercase">
            {label}
          </p>
          <p className="tnum mt-3 text-2xl leading-tight font-semibold whitespace-nowrap text-ink">
            {value}
          </p>
          {note && <p className="mt-1.5 text-xs text-ink-3">{note}</p>}
        </div>
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mist text-ink-2">
            <Icon size={18} />
          </span>
        )}
      </div>
    </Card>
  )
}

export function EmptyState({ icon: Icon, title, message, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {Icon && <Icon size={30} className="text-line" />}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {message && <p className="max-w-sm text-sm text-ink-3">{message}</p>}
      {children}
    </div>
  )
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-ink-3">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink" />
      {label}
    </div>
  )
}
