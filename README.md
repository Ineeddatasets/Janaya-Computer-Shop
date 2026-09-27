# Janaya Computer Shop — Web System

Two things live in this project:

1. **The public storefront** at `/`, a marketing site selling computers.
2. **The management system** behind it, covering the eight modules in the system
   architecture diagram: login, customer management, product and inventory
   management, sales, reports and analytics, supplier management, the database
   layer, and the store owner dashboard.

It is a full stack: a React frontend and an Express + MySQL backend that share
one origin. Every screen reads and writes through a real API backed by the
MySQL database module from the diagram, with passwords hashed, sessions kept in
the database, and stock changes done in transactions.

Two roles sign in — the store owner and the cashier or staff. Customers are
records the staff manage, not logins; sales happen at the counter.

Deploying it — locally, on a host, on a VPS, or with Docker — is covered in
**[DEPLOYMENT.md](DEPLOYMENT.md)**.

## The storefront

The public page at `/` needs no sign-in.

**One design runs through the whole product.** The storefront and the staff
system share it: white paper, near-black ink, one
warm off-white for banded surfaces, hairline rules, pill buttons and tight
negative tracking on display type. The palette is declared once in
`src/index.css` and aliased by `src/storefront/storefront.css`.

Colour was previously used to label each module, carried over from the
architecture diagram. That is gone. The only colours left mean something:
green for healthy stock, amber for a reorder point, red for out of stock or a
destructive action.

**Every image is SVG.** There is no photography in this project, so the hero
workstation, the category glyphs and the wordmark are drawn in
`src/storefront/art.jsx`, and each product type is drawn in
`src/storefront/productArt.jsx`. Nothing loads over the network except the
typeface, and the artwork stays sharp at any size.

## Product pictures

Every product record carries two fields:

- `art` names its drawing: `laptop`, `tower`, `cpu`, `gpu`, `ram`,
  `motherboard`, `psu`, `ssd`, `hdd`, `extdrive`, `monitor`, `keyboard`,
  `mouse`, `headset`, `printer`, `router`, `switch`, `cable`, `ups`,
  `backpack` or `hub`.
- `image` holds a real photograph. Twenty-three of the twenty-four seeded
  products carry one; the UPS keeps its drawing because no suitable photo was
  found, which is exactly the fallback working.

`ProductImage` prefers the photograph and falls back to the drawing, including
when a photo fails to load, so a dead URL degrades quietly instead of leaving a
broken image. Pictures appear on the storefront cards, the range panel, the
point-of-sale tiles and the inventory table, all from that one field.

### About the photographs

They come from Unsplash, under the Unsplash Licence, which permits commercial
use without attribution. **They are stand-ins, not the actual products**: a
generic laptop stands in for the Acer Aspire, because the shop has no licence to
Acer's own product photography. Using a manufacturer's press images on a
storefront is a copyright problem, so they are deliberately not used here.

Replace them with photographs of the actual units on the shelf and the site
becomes truthful as well as attractive. Set `image` on the product to a URL, or
import a file and assign it:

```js
import aspire from '../assets/acer-aspire-15.jpg'
// ...
{ id: 'P-001', /* ... */ image: aspire }
```

The storefront reads the live catalogue through `src/data/api.js`, so the stock
counts, price ranges and availability badges on the marketing page are the same
numbers the shop system holds. Change a price in Products and the storefront
shows it.

Layout of `src/storefront/`:

| File | What it holds |
| --- | --- |
| `Storefront.jsx` | The marketing page: composition and hero |
| `chrome.jsx` | The storefront's navigation and footer |
| `sections.jsx` | The mid-page bands |
| `parts.jsx` | Buttons, section headers, scroll reveal, count-up |
| `art.jsx` | The hero scene, category glyphs and wordmark |
| `productArt.jsx` | A drawing per product type, and `ProductImage` |
| `content.js` | All copy, kept out of the layout |
| `storefront.css` | Design tokens, type scale, animation |

## Running it

You need **Node 20+** and a **MySQL** or MariaDB server. On Windows the simplest
is XAMPP — start MySQL from its Control Panel (Apache is not needed).

```bash
cp .env.example .env     # then set SESSION_SECRET; XAMPP defaults need no DB password
npm install
npm run db:reset         # create the schema and load the demo data
npm run dev              # frontend on :5173, API on :4000
```

Then open http://localhost:5173 and sign in.

`npm run dev` runs the frontend and the API together, with the frontend proxying
`/api` to the API so they are same-origin in the browser. For a single
production server (`npm run build` then `npm start`) and every hosting option,
see [DEPLOYMENT.md](DEPLOYMENT.md).

## Signing in

Both accounts are listed on the login screen and fill the form when clicked.

| Account | Username | Password | Can reach |
| --- | --- | --- | --- |
| Store Owner | `owner` | `owner123` | Every staff module, including the dashboard and reports |
| Cashier / Staff | `cashier` | `cashier123` | Sales and customers only |

The storefront links to the sign-in page from its navigation and footer.

The cashier runs the till: record a sale, and keep customer records. Products,
inventory, suppliers, purchase orders, reports and the dashboard are the
owner's. The cashier still *reads* the catalogue, because the point-of-sale
screen needs prices and stock.

Route access is enforced on both sides. A cashier who types `/products` into the
address bar is sent back to the sales screen, and the API refuses the same
request with a 403 even if the page did not.

## Customers are records, not logins

There is no customer sign-in and no online ordering. Sales happen at the counter,
which is what the Sales Management module in the diagram describes. Customers are
records the cashier creates and attaches to a sale; a walk-in needs no record at
all. A receipt renders at `/sales/receipt/:id` for staff, with no shell, so it
prints clean.

## Data

Records live in MySQL. `npm run db:seed` loads the demo set: 24 products, 8
customers, 4 suppliers, 6 purchase orders, two staff accounts, and about four
months of sales history from a fixed seed, so the reports read the same on every
fresh install.

Because it is a real database, changes persist. A sale recorded at the counter
stays recorded, appears in the customer's purchase history, and moves the
reports and dashboard — through a refresh, a restart, or a redeploy. To return
to the pristine demo state, run `npm run db:reset`.

## The backend

Every screen reads and writes through `src/data/api.js` and nothing else, which
is why swapping the in-memory mock for the real API touched only that one file:
its functions now call `/api` instead of arrays, returning the same shapes, so
no page changed.

The server is Express, in `server/`:

| Path | Handles |
| --- | --- |
| `server/index.js` | App wiring: sessions, security headers, serving the built app in production |
| `server/db.js` | The MySQL connection pool and a transaction helper |
| `server/schema.sql` | The database tables |
| `server/migrate.js`, `seed.js` | Create the schema; load the demo data |
| `server/auth.js` | Role guards (`requireStaff`, `requireOwner`, …) |
| `server/routes/` | One file per resource: auth, products, customers, suppliers, purchase orders, sales |

What the backend guarantees that a mock could not:

- **Passwords** are bcrypt hashes; the plain-text logins exist only as demo
  hints in `src/data/seed.js`.
- **Sessions** live in MySQL, and the browser holds only an `httpOnly` cookie.
- **Authorisation** is enforced per route. The public product list omits cost
  and supplier; the cashier records sales and manages customers; products,
  suppliers, purchase orders, deletion and reports are the owner's alone.
- **A sale is one transaction.** Prices and stock are read under a row lock,
  totals are computed on the server, and stock is decremented atomically, so an
  oversell or a half-written sale cannot happen.

## Layout

```
src/
  data/       seed.js (demo records) and api.js (the single API client)
  store/      auth session, shop records and mutations, toasts
  lib/        formatting, report calculations, navigation
  components/ layout shell, shared UI, charts
  pages/      one file per staff module screen
  storefront/ the public marketing site
server/
  index.js    Express app (API + serves the built app in production)
  db.js       MySQL pool and transaction helper
  routes/     the API, one file per resource
  schema.sql  the tables
  migrate.js  create the schema
  seed.js     load the demo data
```

Navigation and route guards both read `src/lib/nav.js`, so the sidebar can never
offer a link the guard would refuse — and the same rules are enforced again in
`server/auth.js`, where they count.

## Notes

- Prices are in Philippine pesos. VAT is 12 percent, authoritative in
  `server/util.js`; the frontend keeps a copy in `src/data/api.js` for display.
- Receipts print on their own. The shell is hidden by the print rules in `src/index.css`.
- Marking a purchase order delivered raises stock, which is the one place stock
  rises outside a manual adjustment.
- Login accounts (owner and cashiers) live in the `users` table; customers are
  a separate `customers` table with no login.
- Charts plot a single measure each, so no chart carries two vertical scales.
