import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pRes, oRes] = await Promise.all([fetch('/api/inventory'), fetch('/api/orders')]);
        if (!pRes.ok || !oRes.ok) throw new Error('Failed');
        const [productsData, ordersData] = await Promise.all([pRes.json(), oRes.json()]);
        setProducts(productsData);
        setOrders(ordersData);
      } catch (err) {
        setError('Failed to fetch data');
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleOrder(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock_quantity < quantity) {
      setError('Insufficient stock');
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: Number(quantity) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed');
      }
      const newOrder = await res.json();
      setOrders(orders => [...orders, newOrder]);
      setProducts(products =>
        products.map(p =>
          p.id === productId ? { ...p, stockQuantity: p.stockQuantity - Number(quantity) } : p
        )
      );
    } catch (e) {
      setError(e.message || 'Failed to create order');
    }
  }

  async function handleUpdateOrder(orderId, updates) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setOrders(orders => orders.map(o => (o.id === orderId ? updated : o)));
    } catch {
      setError('Failed to update order');
    }
  }

  async function handleDeleteOrder(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setOrders(orders => orders.filter(o => o.id !== orderId));
    } catch {
      setError('Failed to delete order');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>
      <table className="min-w-full border mb-8">
        <thead>
          <tr>
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Order</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.stock_quantity}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  placeholder="Qty"
                  className="border px-2 py-1 w-16 mr-2"
                  id={`qty-${product.id}`}
                />
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    const qty = Number(document.getElementById(`qty-${product.id}`).value);
                    handleOrder(product.id, qty);
                  }}
                >
                  Place Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-semibold mb-2">Order History</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Order ID</th>
            <th className="border px-4 py-2">Product ID</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Update</th>
            <th className="border px-4 py-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td className="border px-4 py-2">{order.id}</td>
              <td className="border px-4 py-2">{order.productId}</td>
              <td className="border px-4 py-2">{order.quantity}</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">
                <select
                  value={order.status}
                  onChange={e => handleUpdateOrder(order.id, { status: e.target.value })}
                  className="border px-2 py-1"
                >
                  <option value="Placed">Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteOrder(order.id)}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
