import mysql from 'mysql2/promise'

/**
 * The one MySQL connection pool for the whole API.
 *
 * Every value comes from the environment so the same code runs against the
 * local XAMPP MySQL in development and a managed MySQL in production, with no
 * edits — only a different .env. See .env.example for the full list.
 */
export const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'janaya_shop',
  // Some managed hosts (Aiven, PlanetScale, some Clever Cloud plans) require
  // TLS on the wire. Set DB_SSL=true to turn it on. The cert is trusted by CA
  // chain like any browser would, so no certificate needs to ship with the app.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
}

export const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  // Free MySQL tiers commonly cap at 5 concurrent connections. Set
  // DB_POOL_SIZE higher when the host allows it.
  connectionLimit: Number(process.env.DB_POOL_SIZE) || 4,
  // DECIMAL columns come back as JS numbers rather than strings, so money and
  // stock arrive already typed. Peso values stay well inside the safe range.
  decimalNumbers: true,
  // Store and read datetimes in UTC so an instant is unambiguous across hosts.
  timezone: 'Z',
})

/** Runs `fn` inside a transaction, committing on success and rolling back on error. */
export async function withTransaction(fn) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

/**
 * Next id in a prefixed, zero-padded sequence (P-001 -> P-025), computed from
 * the current maximum so ids never collide. Pass a transaction connection when
 * generating inside one.
 */
export async function nextId(runner, table, column, prefix, width) {
  const [rows] = await runner.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(${column}, ?) AS UNSIGNED)), 0) + 1 AS n FROM ${table}`,
    [prefix.length + 1],
  )
  return prefix + String(rows[0].n).padStart(width, '0')
}
