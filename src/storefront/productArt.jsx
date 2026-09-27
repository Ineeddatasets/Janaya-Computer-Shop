import { useEffect, useState } from 'react'

/**
 * Product artwork.
 *
 * There is no photography in this project, so each product type is drawn as
 * SVG in a single greyscale palette. They share one viewBox, one light source
 * and one set of tones, so a grid of them reads as one set rather than a pile
 * of clip art.
 *
 * A product carries an `art` key naming its drawing and an `image` field for a
 * real photograph. `ProductImage` prefers the photograph when one is set, so
 * dropping real pictures in later needs no change to any screen.
 */

const C = {
  face: '#e4e2dd',
  faceHi: '#f2f1ee',
  mid: '#c3c0b9',
  edge: '#9b9891',
  deep: '#56534e',
  ink: '#33312e',
  screen: '#2b2b30',
  screenHi: '#6f7480',
}

function Plate({ children, label }) {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label={label} className="h-full w-full">
      <ellipse cx="80" cy="108" rx="46" ry="5" fill={C.ink} opacity="0.09" />
      {children}
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Computers                                                         */
/* ---------------------------------------------------------------- */

const laptop = () => (
  <Plate label="Laptop">
    <path d="M42 34h76a4 4 0 0 1 4 4v52H38V38a4 4 0 0 1 4-4z" fill={C.mid} />
    <rect x="44" y="40" width="72" height="46" rx="2" fill={C.screen} />
    <path d="M44 40h72v46z" fill={C.screenHi} opacity="0.18" />
    <path d="M26 90h108l6 10a3 3 0 0 1-2.6 4.4H22.6A3 3 0 0 1 20 100z" fill={C.face} />
    <path d="M26 90h108l2.2 3.6H23.8z" fill={C.faceHi} />
    <rect x="66" y="97" width="28" height="3" rx="1.5" fill={C.edge} />
  </Plate>
)

const tower = () => (
  <Plate label="Desktop tower">
    <rect x="52" y="16" width="56" height="88" rx="5" fill={C.mid} />
    <rect x="57" y="21" width="46" height="78" rx="3" fill={C.ink} />
    <rect x="57" y="21" width="16" height="78" fill={C.screenHi} opacity="0.1" />
    <circle cx="80" cy="66" r="15" fill="none" stroke={C.edge} strokeWidth="2" />
    <g stroke={C.edge} strokeWidth="1.6" strokeLinecap="round">
      <path d="M80 54v7M91 62l-6 3M91 73l-6-3M80 81v-7M69 73l6-3M69 62l6 3" />
    </g>
    <rect x="63" y="28" width="34" height="4" rx="2" fill={C.edge} opacity="0.7" />
    <rect x="63" y="36" width="24" height="4" rx="2" fill={C.edge} opacity="0.5" />
    <rect x="63" y="90" width="12" height="3" rx="1.5" fill={C.faceHi} />
  </Plate>
)

/* ---------------------------------------------------------------- */
/* Components                                                        */
/* ---------------------------------------------------------------- */

const cpu = () => (
  <Plate label="Processor">
    <g stroke={C.edge} strokeWidth="2.4" strokeLinecap="round">
      <path d="M62 34V24M74 34V24M86 34V24M98 34V24M62 86v10M74 86v10M86 86v10M98 86v10" />
      <path d="M54 42H44M54 54H44M54 66H44M54 78H44M106 42h10M106 54h10M106 66h10M106 78h10" />
    </g>
    <rect x="54" y="34" width="52" height="52" rx="4" fill={C.mid} />
    <rect x="61" y="41" width="38" height="38" rx="2" fill={C.deep} />
    <rect x="61" y="41" width="38" height="14" fill={C.screenHi} opacity="0.14" />
    <circle cx="66" cy="82" r="2" fill={C.faceHi} />
  </Plate>
)

const gpu = () => (
  <Plate label="Graphics card">
    <rect x="22" y="42" width="116" height="40" rx="4" fill={C.mid} />
    <rect x="22" y="42" width="116" height="10" fill={C.faceHi} opacity="0.5" />
    <circle cx="56" cy="63" r="14" fill={C.deep} />
    <circle cx="102" cy="63" r="14" fill={C.deep} />
    <g fill={C.edge}>
      <circle cx="56" cy="63" r="4" />
      <circle cx="102" cy="63" r="4" />
    </g>
    <path d="M22 82h116v6a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3z" fill={C.edge} />
    <rect x="130" y="36" width="8" height="52" rx="2" fill={C.deep} />
    <g fill={C.ink} opacity="0.55">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={38 + i * 12} y="91" width="7" height="5" rx="1" />
      ))}
    </g>
  </Plate>
)

const ram = () => (
  <Plate label="Memory module">
    <rect x="18" y="40" width="124" height="34" rx="3" fill={C.mid} />
    <path d="M18 40h124l-6 12H24z" fill={C.faceHi} opacity="0.7" />
    <g fill={C.deep}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={26 + i * 17} y="46" width="12" height="22" rx="1.5" />
      ))}
    </g>
    <rect x="18" y="74" width="124" height="10" rx="1.5" fill={C.edge} />
    <g fill={C.ink} opacity="0.5">
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={22 + i * 6} y="76" width="3.5" height="8" />
      ))}
    </g>
    <rect x="76" y="76" width="8" height="8" fill={C.faceHi} />
  </Plate>
)

const motherboard = () => (
  <Plate label="Motherboard">
    <rect x="30" y="18" width="100" height="86" rx="4" fill={C.deep} />
    <rect x="40" y="28" width="30" height="30" rx="2" fill={C.mid} />
    <rect x="46" y="34" width="18" height="18" rx="1" fill={C.edge} />
    <g fill={C.mid}>
      <rect x="78" y="28" width="7" height="30" rx="1.5" />
      <rect x="89" y="28" width="7" height="30" rx="1.5" />
      <rect x="100" y="28" width="7" height="30" rx="1.5" />
      <rect x="111" y="28" width="7" height="30" rx="1.5" />
    </g>
    <rect x="40" y="70" width="78" height="7" rx="2" fill={C.edge} />
    <rect x="40" y="83" width="52" height="7" rx="2" fill={C.edge} opacity="0.7" />
    <g fill={C.faceHi} opacity="0.35">
      <circle cx="36" cy="24" r="2" />
      <circle cx="124" cy="24" r="2" />
      <circle cx="36" cy="98" r="2" />
      <circle cx="124" cy="98" r="2" />
    </g>
  </Plate>
)

const psu = () => (
  <Plate label="Power supply">
    <rect x="34" y="34" width="92" height="58" rx="5" fill={C.mid} />
    <rect x="34" y="34" width="92" height="14" fill={C.faceHi} opacity="0.55" />
    <circle cx="74" cy="63" r="21" fill={C.deep} />
    <circle cx="74" cy="63" r="21" fill="none" stroke={C.edge} strokeWidth="2" />
    <g stroke={C.edge} strokeWidth="1.6">
      <path d="M74 42v42M53 63h42M59 48l30 30M89 48L59 78" />
    </g>
    <rect x="104" y="52" width="16" height="22" rx="2" fill={C.deep} />
    <path d="M126 60c12 0 12 10 22 6" fill="none" stroke={C.edge} strokeWidth="3" strokeLinecap="round" />
  </Plate>
)

/* ---------------------------------------------------------------- */
/* Storage                                                           */
/* ---------------------------------------------------------------- */

const ssd = () => (
  <Plate label="Solid state drive">
    <rect x="20" y="48" width="120" height="26" rx="3" fill={C.mid} />
    <rect x="20" y="48" width="120" height="9" fill={C.faceHi} opacity="0.6" />
    <g fill={C.deep}>
      <rect x="34" y="54" width="26" height="14" rx="1.5" />
      <rect x="66" y="54" width="26" height="14" rx="1.5" />
      <rect x="98" y="54" width="18" height="14" rx="1.5" />
    </g>
    <g fill={C.edge}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={22 + i * 3.4} y="52" width="2" height="18" />
      ))}
    </g>
    <circle cx="128" cy="61" r="4" fill="none" stroke={C.edge} strokeWidth="2" />
  </Plate>
)

const hdd = () => (
  <Plate label="Hard drive">
    <rect x="30" y="30" width="100" height="62" rx="4" fill={C.mid} />
    <rect x="30" y="30" width="100" height="16" fill={C.faceHi} opacity="0.55" />
    <circle cx="76" cy="62" r="22" fill={C.deep} />
    <circle cx="76" cy="62" r="8" fill={C.edge} />
    <circle cx="76" cy="62" r="2.5" fill={C.faceHi} />
    <path d="M112 40l-16 26 12 6" fill="none" stroke={C.edge} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <g fill={C.edge} opacity="0.8">
      <circle cx="37" cy="37" r="2" />
      <circle cx="123" cy="37" r="2" />
      <circle cx="37" cy="85" r="2" />
      <circle cx="123" cy="85" r="2" />
    </g>
  </Plate>
)

const extdrive = () => (
  <Plate label="Portable drive">
    <rect x="38" y="38" width="84" height="52" rx="8" fill={C.mid} />
    <rect x="38" y="38" width="84" height="18" rx="8" fill={C.faceHi} opacity="0.6" />
    <rect x="38" y="52" width="84" height="4" fill={C.faceHi} opacity="0.35" />
    <rect x="52" y="66" width="34" height="4" rx="2" fill={C.edge} />
    <circle cx="108" cy="76" r="3" fill={C.edge} />
    <path d="M122 60h14" stroke={C.edge} strokeWidth="4" strokeLinecap="round" />
  </Plate>
)

/* ---------------------------------------------------------------- */
/* Peripherals                                                       */
/* ---------------------------------------------------------------- */

const monitor = () => (
  <Plate label="Monitor">
    <rect x="22" y="18" width="116" height="70" rx="4" fill={C.mid} />
    <rect x="27" y="23" width="106" height="56" rx="2" fill={C.screen} />
    <path d="M27 23h106L70 79H27z" fill={C.screenHi} opacity="0.16" />
    <path d="M70 88h20l4 12H66z" fill={C.edge} />
    <rect x="52" y="100" width="56" height="6" rx="3" fill={C.face} />
  </Plate>
)

const keyboard = () => (
  <Plate label="Keyboard">
    <path d="M20 42h120a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V46a4 4 0 0 1 4-4z" fill={C.mid} />
    <path d="M20 42h120a4 4 0 0 1 4 4v4H16v-4a4 4 0 0 1 4-4z" fill={C.faceHi} opacity="0.6" />
    <g fill={C.deep}>
      {Array.from({ length: 13 }, (_, c) =>
        Array.from({ length: 4 }, (_, r) => (
          <rect key={c + '-' + r} x={23 + c * 9.2} y={54 + r * 8.4} width="7" height="6.4" rx="1.2" />
        )),
      )}
    </g>
    <rect x="55" y="79" width="42" height="6.4" rx="1.2" fill={C.deep} />
  </Plate>
)

const mouse = () => (
  <Plate label="Mouse">
    <path d="M80 22c18 0 30 14 30 32v22c0 16-13 26-30 26s-30-10-30-26V54c0-18 12-32 30-32z" fill={C.mid} />
    <path d="M80 22c-18 0-30 14-30 32v6h30z" fill={C.faceHi} opacity="0.55" />
    <path d="M80 22v38" stroke={C.edge} strokeWidth="1.6" />
    <rect x="76.5" y="34" width="7" height="16" rx="3.5" fill={C.deep} />
  </Plate>
)

const headset = () => (
  <Plate label="Headset">
    <path d="M42 72V60a38 38 0 0 1 76 0v12" fill="none" stroke={C.mid} strokeWidth="9" strokeLinecap="round" />
    <rect x="30" y="62" width="22" height="34" rx="9" fill={C.deep} />
    <rect x="108" y="62" width="22" height="34" rx="9" fill={C.deep} />
    <rect x="35" y="68" width="12" height="22" rx="6" fill={C.edge} />
    <rect x="113" y="68" width="12" height="22" rx="6" fill={C.edge} />
    <path d="M52 88c8 6 12 10 16 10" fill="none" stroke={C.edge} strokeWidth="3.5" strokeLinecap="round" />
  </Plate>
)

const printer = () => (
  <Plate label="Printer">
    <rect x="34" y="52" width="92" height="40" rx="5" fill={C.mid} />
    <rect x="34" y="52" width="92" height="12" fill={C.faceHi} opacity="0.55" />
    <rect x="52" y="22" width="56" height="30" rx="3" fill={C.face} />
    <rect x="58" y="28" width="44" height="4" rx="2" fill={C.edge} />
    <rect x="58" y="36" width="32" height="4" rx="2" fill={C.edge} opacity="0.7" />
    <rect x="48" y="86" width="64" height="14" rx="3" fill={C.face} />
    <rect x="100" y="60" width="18" height="10" rx="2" fill={C.deep} />
    <g fill={C.edge}>
      <circle cx="46" cy="65" r="2.5" />
    </g>
  </Plate>
)

/* ---------------------------------------------------------------- */
/* Networking                                                        */
/* ---------------------------------------------------------------- */

const router = () => (
  <Plate label="Router">
    <g stroke={C.edge} strokeWidth="5" strokeLinecap="round">
      <path d="M46 60V28" />
      <path d="M114 60V28" />
    </g>
    <rect x="30" y="58" width="100" height="30" rx="6" fill={C.mid} />
    <rect x="30" y="58" width="100" height="9" rx="6" fill={C.faceHi} opacity="0.6" />
    <g fill={C.deep}>
      <circle cx="48" cy="76" r="3" />
      <circle cx="62" cy="76" r="3" />
      <circle cx="76" cy="76" r="3" />
    </g>
    <path d="M96 76h26" stroke={C.edge} strokeWidth="2.5" strokeLinecap="round" />
  </Plate>
)

const networkSwitch = () => (
  <Plate label="Network switch">
    <rect x="20" y="52" width="120" height="34" rx="4" fill={C.mid} />
    <rect x="20" y="52" width="120" height="10" fill={C.faceHi} opacity="0.6" />
    <g fill={C.deep}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={28 + i * 13} y="66" width="10" height="12" rx="1.5" />
      ))}
    </g>
    <g fill={C.edge}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={30 + i * 13} y="62" width="6" height="2" rx="1" />
      ))}
    </g>
  </Plate>
)

const cable = () => (
  <Plate label="Network cable">
    <path
      d="M40 84c0-26 26-26 26-46 0-10-8-14-14-10"
      fill="none"
      stroke={C.mid}
      strokeWidth="7"
      strokeLinecap="round"
    />
    <path
      d="M120 40c0 26-26 26-26 46 0 10 8 14 14 10"
      fill="none"
      stroke={C.mid}
      strokeWidth="7"
      strokeLinecap="round"
    />
    <g fill={C.deep}>
      <rect x="30" y="80" width="22" height="16" rx="2.5" />
      <rect x="108" y="26" width="22" height="16" rx="2.5" />
    </g>
    <g fill={C.edge}>
      <rect x="36" y="76" width="10" height="6" rx="1.5" />
      <rect x="114" y="42" width="10" height="6" rx="1.5" />
    </g>
  </Plate>
)

/* ---------------------------------------------------------------- */
/* Accessories                                                       */
/* ---------------------------------------------------------------- */

const ups = () => (
  <Plate label="Uninterruptible power supply">
    <rect x="44" y="24" width="72" height="76" rx="6" fill={C.mid} />
    <rect x="44" y="24" width="72" height="16" rx="6" fill={C.faceHi} opacity="0.55" />
    <rect x="54" y="46" width="52" height="18" rx="2.5" fill={C.screen} />
    <path d="M78 50l-6 9h6l-2 6 8-10h-6z" fill={C.screenHi} />
    <g fill={C.deep}>
      <rect x="56" y="72" width="20" height="16" rx="2" />
      <rect x="84" y="72" width="20" height="16" rx="2" />
    </g>
    <g fill={C.faceHi}>
      <circle cx="62" cy="80" r="2" />
      <circle cx="70" cy="80" r="2" />
      <circle cx="90" cy="80" r="2" />
      <circle cx="98" cy="80" r="2" />
    </g>
  </Plate>
)

const backpack = () => (
  <Plate label="Laptop backpack">
    <path d="M60 34h40a22 22 0 0 1 22 22v34a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10V56a22 22 0 0 1 22-22z" fill={C.mid} />
    <path d="M60 34h40a22 22 0 0 1 22 22v6H38v-6a22 22 0 0 1 22-22z" fill={C.faceHi} opacity="0.5" />
    <path d="M66 34V26a14 14 0 0 1 28 0v8" fill="none" stroke={C.edge} strokeWidth="4" />
    <rect x="54" y="70" width="52" height="20" rx="4" fill={C.deep} />
    <path d="M54 80h52" stroke={C.edge} strokeWidth="2" />
    <circle cx="80" cy="80" r="3" fill={C.faceHi} />
  </Plate>
)

const hub = () => (
  <Plate label="USB hub">
    <rect x="40" y="52" width="80" height="24" rx="5" fill={C.mid} />
    <rect x="40" y="52" width="80" height="8" rx="5" fill={C.faceHi} opacity="0.6" />
    <g fill={C.deep}>
      <rect x="50" y="62" width="14" height="8" rx="1.5" />
      <rect x="70" y="62" width="14" height="8" rx="1.5" />
      <rect x="90" y="62" width="14" height="8" rx="1.5" />
    </g>
    <path d="M40 64H24a8 8 0 0 1-8-8v-4" fill="none" stroke={C.mid} strokeWidth="6" strokeLinecap="round" />
    <rect x="10" y="38" width="12" height="14" rx="2" fill={C.deep} />
  </Plate>
)

export const productArt = {
  laptop,
  tower,
  cpu,
  gpu,
  ram,
  motherboard,
  psu,
  ssd,
  hdd,
  extdrive,
  monitor,
  keyboard,
  mouse,
  headset,
  printer,
  router,
  switch: networkSwitch,
  cable,
  ups,
  backpack,
  hub,
}

/**
 * Renders a product's picture: the photograph if one is set on the record,
 * otherwise the drawing named by its `art` key.
 *
 * A photograph that fails to load falls back to the drawing rather than
 * leaving a broken image on the page, so a dead URL degrades quietly.
 */
export function ProductImage({ product, className = '' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [product?.image])

  if (!product) return null

  if (product.image && !failed) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={'h-full w-full object-cover ' + className}
      />
    )
  }

  const Art = productArt[product.art] || productArt.tower
  return (
    <span className={'block h-full w-full ' + className}>
      <Art />
    </span>
  )
}
