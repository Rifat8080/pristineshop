import prisma from '../../../lib/prisma';
import { hashPassword, signToken, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  setTokenCookie(res, token);
  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
