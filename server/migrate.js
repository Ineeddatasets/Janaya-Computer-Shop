import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { config } from './db.js'

/**
 * Creates the database (if absent) and applies schema.sql. Destructive: the
 * schema drops and recreates every table, so run it on a fresh or disposable
 * database, then seed. Invoked by `npm run db:migrate`.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

const admin = await mysql.createConnection({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  multipleStatements: true,
})
await admin.query(
  `CREATE DATABASE IF NOT EXISTS \`${config.database}\`
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
)
await admin.end()

const conn = await mysql.createConnection({ ...config, multipleStatements: true })
await conn.query(schema)
await conn.end()

console.log(`✓ Schema applied to database "${config.database}".`)
