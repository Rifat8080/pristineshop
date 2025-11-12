import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
      res.status(200).json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, stockQuantity, price, image, description, title, subtitle } = req.body;
      const created = await prisma.product.create({ data: { name, stockQuantity: Number(stockQuantity) || 0, price: Number(price) || 0, image, description, title, subtitle } });
      res.status(201).json(created);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create product' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
