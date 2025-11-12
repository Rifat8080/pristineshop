import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(order);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      // If status is being changed to Cancelled, restore product stock
      if (updates.status) {
        const existing = await prisma.order.findUnique({ where: { id } });
        if (existing && existing.status !== 'Cancelled' && updates.status === 'Cancelled') {
          // restore stock
          await prisma.product.update({ where: { id: existing.productId }, data: { stockQuantity: { increment: existing.quantity } } });
        }
        if (existing && existing.status === 'Cancelled' && updates.status !== 'Cancelled') {
          // reducing stock again when re-activating is risky; skip automatically
        }
      }
      const updated = await prisma.order.update({ where: { id }, data: updates });
      return res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update order' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      // restore stock
      await prisma.product.update({ where: { id: existing.productId }, data: { stockQuantity: { increment: existing.quantity } } });
      await prisma.order.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
