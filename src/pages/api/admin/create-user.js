import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const requester = await getUserFromRequest(req);
  if (!requester) return res.status(401).json({ error: 'Not authenticated' });

  // Only ADMIN or SUPER_ADMIN can create users; only SUPER_ADMIN can create SUPER_ADMIN
  if (!['ADMIN', 'SUPER_ADMIN'].includes(requester.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { email, password, name, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  // Prevent ADMIN from creating SUPER_ADMIN
  if (role === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only SUPER_ADMIN may create SUPER_ADMIN accounts' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await hashPassword(password);
  const created = await prisma.user.create({ data: { email, password: hashed, name, role: role || 'USER' } });
  // return safe representation
  res.status(201).json({ id: created.id, email: created.email, name: created.name, role: created.role });
}
