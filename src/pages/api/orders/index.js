import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({ orderBy: { id: 'desc' } });
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
  const { productId, quantity } = req.body;
  // Basic stock check
  if (!productId || typeof productId !== 'string') return res.status(400).json({ error: 'Invalid product' });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(400).json({ error: 'Invalid product' });
  if (product.stockQuantity < Number(quantity)) return res.status(400).json({ error: 'Insufficient stock' });

  const created = await prisma.order.create({ data: { productId: productId, quantity: Number(quantity) } });
  // decrement stock
  await prisma.product.update({ where: { id: productId }, data: { stockQuantity: product.stockQuantity - Number(quantity) } });

  res.status(201).json(created);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create order' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
