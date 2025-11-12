import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const requester = await getUserFromRequest(req);
  if (!requester) return res.status(401).json({ error: 'Not authenticated' });

  // Only ADMIN or SUPER_ADMIN can promote users
  if (!['ADMIN', 'SUPER_ADMIN'].includes(requester.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId, role } = req.body || {};
  if (!userId || !role) return res.status(400).json({ error: 'Missing userId or role' });

  // Prevent ADMIN from promoting to SUPER_ADMIN
  if (role === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only SUPER_ADMIN may promote to SUPER_ADMIN' });
  }

  // Prevent self-demotion
  if (userId === requester.id) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  res.status(200).json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
}
