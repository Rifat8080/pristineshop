import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const BarcodeGenerator = dynamic(() => import('../components/BarcodeGenerator'), { ssr: false });

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', stock_quantity: 0, price: 0, image: '', description: '', title: '', subtitle: '', sku: '', barcodeFormat: 'CODE128' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products');
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  async function handleUpdateInventory(productId, newQuantity) {
    try {
      const res = await fetch(`/api/inventory/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: Number(newQuantity) }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setProducts(products => products.map(p => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError('Failed to update inventory');
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          stockQuantity: Number(newProduct.stock_quantity),
          price: Number(newProduct.price),
          image: newProduct.image,
          description: newProduct.description,
          title: newProduct.title,
          subtitle: newProduct.subtitle,
          sku: newProduct.sku || undefined,
          barcodeFormat: newProduct.barcodeFormat || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
  const created = await res.json();
  setProducts(products => [...products, created]);
  setNewProduct({ name: '', stock_quantity: 0, price: 0, image: '', description: '', title: '', subtitle: '' });
    } catch (err) {
      setError('Failed to create product');
    }
  }

  async function handleDeleteProduct(productId) {
    try {
      const res = await fetch(`/api/inventory/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setProducts(products => products.filter(p => p.id !== productId));
    } catch (err) {
      setError('Failed to delete product');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
      <form onSubmit={handleCreateProduct} className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block mb-1">Product Name</label>
          <input
            type="text"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={newProduct.title}
            onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
            className="border px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1">Subtitle</label>
          <input
            type="text"
            value={newProduct.subtitle}
            onChange={e => setNewProduct({ ...newProduct, subtitle: e.target.value })}
            className="border px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1">Stock Quantity</label>
          <input
            type="number"
            min="0"
            value={newProduct.stock_quantity}
            onChange={e => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })}
            className="border px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block mb-1">SKU (optional)</label>
          <input
            type="text"
            value={newProduct.sku}
            onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
            className="border px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1">Barcode Format</label>
          <select value={newProduct.barcodeFormat} onChange={e => setNewProduct({ ...newProduct, barcodeFormat: e.target.value })} className="border px-2 py-1">
            <option value="CODE128">CODE128</option>
            <option value="EAN13">EAN13</option>
            <option value="UPC">UPC</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Image URL</label>
          <input
            type="text"
            value={newProduct.image}
            onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
            className="border px-2 py-1"
          />
        </div>
        <div className="w-64">
          <label className="block mb-1">Description</label>
          <input
            type="text"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
            className="border px-2 py-1 w-full"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Product</button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Subtitle</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">SKU</th>
            <th className="border px-4 py-2">Barcode</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Update</th>
            <th className="border px-4 py-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.title || '-'}</td>
              <td className="border px-4 py-2">{product.subtitle || '-'}</td>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.sku || '-'}</td>
              <td className="border px-4 py-2">
                {product.barcode ? <BarcodeGenerator value={product.barcode} /> : '-'}
              </td>
              <td className="border px-4 py-2">${Number(product.price).toFixed(2)}</td>
              <td className="border px-4 py-2">{product.stockQuantity}</td>
              <td className="border px-4 py-2">
                {product.image ? <Image src={product.image} alt={product.name} width={48} height={48} className="h-12" /> : '-'}
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  min="0"
                  defaultValue={product.stockQuantity}
                  onBlur={e => handleUpdateInventory(product.id, Number(e.target.value))}
                  className="border px-2 py-1 w-20"
                />
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => setEditingProduct(product.id)}
                >Edit</button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteProduct(product.id)}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingProduct && (
        <EditProductForm
          productId={editingProduct}
          products={products}
          setProducts={setProducts}
          setEditingProduct={setEditingProduct}
          setError={setError}
        />
      )}
    </div>
  );
}

function EditProductForm({ productId, products, setProducts, setEditingProduct, setError }) {
  const productToEdit = products.find(p => p.id === productId);
  const [formData, setFormData] = useState({
    name: productToEdit.name,
    stockQuantity: productToEdit.stockQuantity,
    price: productToEdit.price,
    image: productToEdit.image || '',
    description: productToEdit.description || '',
    title: productToEdit.title || '',
    subtitle: productToEdit.subtitle || '',
    sku: productToEdit.sku || '',
    barcode: productToEdit.barcode || '',
    barcodeFormat: productToEdit.barcodeFormat || 'CODE128',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inventory/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
      setEditingProduct(null); // Close the form
    } catch (err) {
      console.error(err);
      setError('Failed to update product');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode</label>
            <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode Format</label>
            <select name="barcodeFormat" value={formData.barcodeFormat} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="CODE128">CODE128</option>
              <option value="EAN13">EAN13</option>
              <option value="UPC">UPC</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div className="col-span-2 flex justify-end space-x-2">
            <button type="button" onClick={() => setEditingProduct(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Update Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
