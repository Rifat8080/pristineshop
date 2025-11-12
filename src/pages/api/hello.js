// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { query } from '../../lib/db';

export default async function handler(req, res) {
  // Simple DB connectivity test: SELECT 1
  try {
    const result = await query('SELECT 1 AS result');
    res.status(200).json({ name: 'John Doe', db: result.rows[0] });
  } catch (err) {
    // If DATABASE_URL is not configured or the DB is unreachable, return the error message.
    console.error('DB test query failed:', err?.message || err);
    res.status(500).json({ name: 'John Doe', error: 'DB test failed', details: err?.message || String(err) });
  }
}
