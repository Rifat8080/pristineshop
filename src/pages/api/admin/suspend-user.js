import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const admin = await getUserFromRequest(req);
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId, suspended } = req.body;
  if (!userId || suspended === undefined) {
    return res.status(400).json({ error: 'Missing userId or suspended' });
  }

  if (userId === admin.id) {
    return res.status(400).json({ error: 'Cannot suspend yourself' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (admin.role === 'ADMIN' && user.role === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'ADMIN cannot suspend SUPER_ADMIN' });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { suspended },
  });

  res.status(200).json(updated);
}
