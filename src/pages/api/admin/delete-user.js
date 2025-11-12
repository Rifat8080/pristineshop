import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const admin = await getUserFromRequest(req);
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  if (userId === admin.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.role === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only SUPER_ADMIN can delete SUPER_ADMIN' });
  }

  await prisma.user.delete({ where: { id: userId } });
  res.status(200).json({ message: 'User deleted' });
}
