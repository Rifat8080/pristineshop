import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
  const product = await prisma.product.findUnique({ where: { id } });
      if (!product) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
  const updated = await prisma.product.update({ where: { id }, data: updates });
      return res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Delete related orders first to avoid FK constraint errors, then delete the product
      await prisma.$transaction([
        prisma.order.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Failed to delete product:', err);
      // If foreign key constraint still prevents deletion, give a helpful message
      if (err?.code === 'P2003') {
        return res.status(400).json({ error: 'Cannot delete product because related records exist' });
      }
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
