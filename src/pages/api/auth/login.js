import prisma from '../../../lib/prisma';
import { verifyPassword, signToken, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await verifyPassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  setTokenCookie(res, token);
  res.status(200).json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
