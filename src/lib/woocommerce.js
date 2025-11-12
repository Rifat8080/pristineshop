// WooCommerce API client for demo store

// Mock data for development

let mockProducts = [
  { id: 1, name: 'T-Shirt', stock_quantity: 50 },
  { id: 2, name: 'Jeans', stock_quantity: 30 },
  { id: 3, name: 'Sneakers', stock_quantity: 20 },
];
let mockOrders = [];

// INVENTORY CRUD
export async function fetchProducts(params = {}) {
  return new Promise(resolve => {
    setTimeout(() => resolve(mockProducts), 300);
  });
}

export async function fetchProductInventory(productId) {
  const product = mockProducts.find(p => p.id === productId);
  return product ? product.stock_quantity : null;
}

export async function createProduct(product) {
  const newProduct = { ...product, id: Date.now() };
  mockProducts.push(newProduct);
  return newProduct;
}

export async function updateProductInventory(productId, newQuantity) {
  mockProducts = mockProducts.map(p =>
    p.id === productId ? { ...p, stock_quantity: newQuantity } : p
  );
  return mockProducts.find(p => p.id === productId);
}

export async function deleteProduct(productId) {
  mockProducts = mockProducts.filter(p => p.id !== productId);
  return true;
}

// ORDERS CRUD
export async function fetchOrders() {
  return new Promise(resolve => {
    setTimeout(() => resolve(mockOrders), 300);
  });
}

export async function createOrder(order) {
  const newOrder = { ...order, id: Date.now(), status: 'Placed' };
  mockOrders.push(newOrder);
  // Update inventory
  mockProducts = mockProducts.map(p =>
    p.id === order.productId ? { ...p, stock_quantity: p.stock_quantity - order.quantity } : p
  );
  return newOrder;
}

export async function updateOrder(orderId, updates) {
  mockOrders = mockOrders.map(o =>
    o.id === orderId ? { ...o, ...updates } : o
  );
  return mockOrders.find(o => o.id === orderId);
}

export async function deleteOrder(orderId) {
  mockOrders = mockOrders.filter(o => o.id !== orderId);
  return true;
}
