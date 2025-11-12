import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { barcode, sku } = req.query;
      if (barcode) {
        const product = await prisma.product.findUnique({ where: { barcode: String(barcode) } });
        return res.status(200).json(product ? [product] : []);
      }
      if (sku) {
        const product = await prisma.product.findUnique({ where: { sku: String(sku) } });
        return res.status(200).json(product ? [product] : []);
      }
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
      const { name, stockQuantity, price, image, description, title, subtitle, sku, barcode, barcodeFormat } = req.body;
      // If sku not provided, generate a simple SKU
      const generatedSku = sku || `SKU-${Date.now().toString(36).toUpperCase()}`;
      // Set barcode at create time to avoid a separate update step. Prefer provided barcode, then sku.
      const barcodeValue = barcode || generatedSku;
      const created = await prisma.product.create({
        data: {
          name,
          stockQuantity: Number(stockQuantity) || 0,
          price: Number(price) || 0,
          image,
          description,
          title,
          subtitle,
          sku: generatedSku,
          barcode: barcodeValue,
          barcodeFormat: barcodeFormat || 'CODE128',
        },
      });
      res.status(201).json(created);
    } catch (err) {
      console.error(err);
      // Prisma unique constraint error => return a 400 with field info
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = err.meta?.target || 'unknown';
        return res.status(400).json({ error: 'Unique constraint failed', target });
      }
      res.status(500).json({ error: 'Failed to create product', details: err.message });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
