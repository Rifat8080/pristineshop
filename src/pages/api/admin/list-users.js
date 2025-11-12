import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const requester = await getUserFromRequest(req);
  if (!requester) return res.status(401).json({ error: 'Not authenticated' });

  // Only ADMIN or SUPER_ADMIN can list users
  if (!['ADMIN', 'SUPER_ADMIN'].includes(requester.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.user.count();

  res.status(200).json({
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
