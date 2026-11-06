import 'dotenv/config'
import { pool, config } from './db.js'

/**
 * Widens products.image from TEXT to MEDIUMTEXT, in place.
 *
 * An uploaded photo is stored inline as a data URL, and TEXT tops out at
 * 65,535 bytes, which one would overflow. Unlike `db:migrate`, this touches a
 * single column and keeps every row, so it is safe to run against a live
 * database. Running it twice does nothing the second time.
 *
 *   npm run db:widen-image
 */
const [[col]] = await pool.query(
  `SELECT DATA_TYPE AS type
     FROM information_schema.COLUMNS
    WHERE table_schema = ? AND table_name = 'products' AND column_name = 'image'`,
  [config.database],
)

if (!col) {
  console.error('✗ No products.image column found in', config.database)
  process.exitCode = 1
} else if (col.type.toLowerCase() === 'mediumtext') {
  console.log('✓ Already MEDIUMTEXT; nothing to do.')
} else {
  console.log(`Altering products.image from ${col.type.toUpperCase()} to MEDIUMTEXT…`)
  await pool.query('ALTER TABLE products MODIFY COLUMN image MEDIUMTEXT NULL')
  const [[now]] = await pool.query('SELECT COUNT(*) AS n FROM products')
  console.log(`✓ Done. ${now.n} products intact.`)
}

await pool.end()
