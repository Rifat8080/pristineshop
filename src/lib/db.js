// Minimal PostgreSQL client wrapper using node-postgres (pg)
// Exports a `query` helper and the `pool` for advanced usage.
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Don't throw here — allow the app to run but queries will fail with clear message.
  console.warn('WARNING: DATABASE_URL is not set. DB queries will fail until it is provided.');
}

const pool = new Pool({ connectionString });

async function query(text, params) {
  return pool.query(text, params);
}

export { query, pool };
