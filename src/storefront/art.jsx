/**
 * All storefront artwork, drawn as SVG.
 *
 * There is no photography in this project, so every image on the page is
 * vector. That keeps the site sharp at any size, loads nothing over the
 * network, and lets the lighting stay consistent from the hero down to the
 * smallest category card.
 */

/* ------------------------------------------------------------------ */
/* Hero: a lit workstation, three-quarter view                         */
/* ------------------------------------------------------------------ */

export function HeroScene({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 700"
      className={className}
      role="img"
      aria-label="A desk with a widescreen monitor, tower and keyboard, lit from behind"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="sf-room" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#191a20" />
          <stop offset="55%" stopColor="#0e0e12" />
          <stop offset="100%" stopColor="#08080a" />
        </linearGradient>

        <radialGradient id="sf-halo" cx="50%" cy="42%" r="42%">
          <stop offset="0%" stopColor="#5b7cff" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#3b52c4" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="sf-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dfe7ff" />
          <stop offset="45%" stopColor="#93a9e8" />
          <stop offset="100%" stopColor="#41508c" />
        </linearGradient>

        <linearGradient id="sf-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2b2d34" />
          <stop offset="30%" stopColor="#4a4d57" />
          <stop offset="55%" stopColor="#31333a" />
          <stop offset="100%" stopColor="#212228" />
        </linearGradient>

        <linearGradient id="sf-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26262c" />
          <stop offset="100%" stopColor="#121216" />
        </linearGradient>

        <linearGradient id="sf-key" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3c44" />
          <stop offset="100%" stopColor="#1d1e23" />
        </linearGradient>

        <filter id="sf-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="26" />
        </filter>

        <filter id="sf-soft-sm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <rect width="1200" height="700" fill="url(#sf-room)" />

      {/* Faint room grid, well below the noise floor of the eye */}
      <g stroke="#ffffff" strokeOpacity="0.028">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={'v' + i} x1={i * 86} y1="0" x2={i * 86} y2="700" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={'h' + i} x1="0" y1={i * 86} x2="1200" y2={i * 86} />
        ))}
      </g>

      <ellipse cx="600" cy="300" rx="470" ry="300" fill="url(#sf-halo)" className="sf-pulse" />

      {/* Desk */}
      <rect x="0" y="512" width="1200" height="188" fill="url(#sf-desk)" />
      <rect x="0" y="512" width="1200" height="1.5" fill="#5c5f6b" opacity="0.5" />

      {/* Monitor */}
      <g>
        <rect x="322" y="118" width="556" height="326" rx="14" fill="url(#sf-metal)" />
        <rect x="336" y="132" width="528" height="286" rx="7" fill="#0a0b10" />
        <rect x="336" y="132" width="528" height="286" rx="7" fill="url(#sf-screen)" opacity="0.62" />

        {/* Content blocks on the screen, suggesting real work */}
        <g opacity="0.26" fill="#0b1020">
          <rect x="360" y="156" width="126" height="9" rx="4.5" />
          <rect x="360" y="176" width="88" height="9" rx="4.5" />
          <rect x="360" y="214" width="214" height="180" rx="8" />
          <rect x="592" y="214" width="248" height="84" rx="8" />
          <rect x="592" y="312" width="248" height="82" rx="8" />
        </g>
        <g opacity="0.34" fill="#ffffff">
          <rect x="606" y="232" width="150" height="7" rx="3.5" />
          <rect x="606" y="250" width="196" height="7" rx="3.5" />
          <rect x="606" y="268" width="110" height="7" rx="3.5" />
          <rect x="606" y="330" width="168" height="7" rx="3.5" />
          <rect x="606" y="348" width="204" height="7" rx="3.5" />
        </g>

        {/* Screen sheen */}
        <path d="M336 132 H864 L560 418 H336 Z" fill="#ffffff" opacity="0.06" />

        {/* Stand */}
        <path d="M566 444 h68 l16 62 h-100 z" fill="#33353d" />
        <rect x="486" y="504" width="228" height="12" rx="6" fill="#3d404a" />
      </g>

      {/* Tower, left */}
      <g>
        <rect x="126" y="286" width="128" height="226" rx="10" fill="url(#sf-metal)" />
        <rect x="140" y="300" width="100" height="198" rx="6" fill="#101116" />
        <rect x="152" y="316" width="76" height="52" rx="4" fill="#1b1d24" />
        <circle cx="190" cy="424" r="30" fill="#15171d" />
        <circle cx="190" cy="424" r="30" fill="none" stroke="#6f86ff" strokeOpacity="0.55" strokeWidth="2" />
        <g stroke="#6f86ff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round">
          <line x1="190" y1="404" x2="190" y2="414" />
          <line x1="207" y1="414" x2="199" y2="419" />
          <line x1="207" y1="434" x2="199" y2="429" />
          <line x1="190" y1="444" x2="190" y2="434" />
          <line x1="173" y1="434" x2="181" y2="429" />
          <line x1="173" y1="414" x2="181" y2="419" />
        </g>
        <rect x="152" y="480" width="42" height="5" rx="2.5" fill="#6f86ff" opacity="0.7" />
      </g>

      {/* Keyboard */}
      <g>
        <rect x="430" y="540" width="340" height="72" rx="10" fill="url(#sf-key)" />
        <g fill="#4c4f59" opacity="0.9">
          {Array.from({ length: 14 }, (_, c) =>
            Array.from({ length: 4 }, (_, r) => (
              <rect
                key={c + '-' + r}
                x={442 + c * 23}
                y={552 + r * 15}
                width="17"
                height="11"
                rx="2.5"
              />
            )),
          )}
        </g>
      </g>

      {/* Mouse */}
      <rect x="800" y="556" width="46" height="66" rx="23" fill="#2f3138" />
      <rect x="820" y="566" width="6" height="16" rx="3" fill="#5b5e69" />

      {/* Mug */}
      <g>
        <rect x="240" y="548" width="52" height="60" rx="8" fill="#2a2c33" />
        <path d="M292 566 h14 a12 12 0 0 1 0 24 h-14" fill="none" stroke="#2a2c33" strokeWidth="7" />
        <ellipse cx="266" cy="550" rx="26" ry="7" fill="#3a3d45" />
      </g>

      {/* Plant silhouette, right */}
      <g opacity="0.85">
        <rect x="966" y="472" width="72" height="46" rx="8" fill="#23252b" />
        <g stroke="#2f3a33" strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M1002 472 C 1002 430 984 412 972 400" />
          <path d="M1002 472 C 1002 424 1020 404 1036 394" />
          <path d="M1002 472 C 1000 442 990 428 978 424" />
        </g>
      </g>

      {/* Warm rim light along the desk edge */}
      <rect x="0" y="506" width="1200" height="10" fill="#8fa8ff" opacity="0.16" filter="url(#sf-soft-sm)" />
      <ellipse cx="600" cy="470" rx="330" ry="70" fill="#6f86ff" opacity="0.13" filter="url(#sf-soft)" />

      {/* Vignette */}
      <rect width="1200" height="700" fill="url(#sf-vig)" />
      <defs>
        <radialGradient id="sf-vig" cx="50%" cy="45%" r="72%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Category glyphs                                                     */
/* ------------------------------------------------------------------ */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Frame({ children, label }) {
  return (
    <svg viewBox="0 0 96 72" role="img" aria-label={label} className="h-full w-full">
      <g {...S}>{children}</g>
    </svg>
  )
}

export const glyphs = {
  Laptops: () => (
    <Frame label="Laptop">
      <path d="M22 20h52v30H22z" />
      <path d="M12 50h72l-4 8H16z" />
      <path d="M40 54h16" />
    </Frame>
  ),
  Desktops: () => (
    <Frame label="Desktop tower">
      <path d="M30 12h36v48H30z" />
      <circle cx="48" cy="40" r="9" />
      <path d="M38 20h16" />
      <path d="M38 26h10" />
    </Frame>
  ),
  Components: () => (
    <Frame label="Processor">
      <path d="M32 24h32v24H32z" />
      <path d="M40 32h16v8H40z" />
      <path d="M38 24v-8M48 24v-8M58 24v-8M38 48v8M48 48v8M58 48v8M32 30h-8M32 42h-8M64 30h8M64 42h8" />
    </Frame>
  ),
  Peripherals: () => (
    <Frame label="Monitor and keyboard">
      <path d="M24 14h48v28H24z" />
      <path d="M44 42v6M38 48h20" />
      <path d="M20 54h56v8H20z" />
    </Frame>
  ),
  Storage: () => (
    <Frame label="Drive">
      <path d="M22 22h52v28H22z" />
      <circle cx="48" cy="36" r="9" />
      <circle cx="48" cy="36" r="2" />
      <path d="M66 44h4" />
    </Frame>
  ),
  Networking: () => (
    <Frame label="Router">
      <path d="M22 40h52v14H22z" />
      <path d="M30 47h6M42 47h6" />
      <path d="M62 34v-6" />
      <path d="M44 30a16 16 0 0 1 24 0" />
      <path d="M50 24a24 24 0 0 1 30 0" />
    </Frame>
  ),
  Accessories: () => (
    <Frame label="Accessories">
      <path d="M28 26h40v22H28z" />
      <path d="M36 26v-6h24v6" />
      <path d="M28 37h40" />
    </Frame>
  ),
}

export function CategoryGlyph({ category, className = '' }) {
  const Glyph = glyphs[category] || glyphs.Components
  return (
    <span className={className}>
      <Glyph />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Wordmark                                                            */
/* ------------------------------------------------------------------ */

export function Mark({ className = '' }) {
  return (
    <svg viewBox="0 0 28 28" className={className} role="img" aria-label="Janaya">
      <rect x="1" y="1" width="26" height="26" rx="8" fill="currentColor" opacity="0.1" />
      <path
        d="M9 8h10v10.5A4.5 4.5 0 0 1 14.5 23h-1A4.5 4.5 0 0 1 9 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
