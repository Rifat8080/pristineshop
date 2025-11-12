import { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';

export default function ScanPage() {
  const [scanned, setScanned] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'

  async function lookupProduct(value) {
    setScanned(value);
    setError(null);
    try {
      // try to lookup by barcode first, then by id
      let res = await fetch(`/api/inventory?barcode=${encodeURIComponent(value)}`);
      let data = [];
      if (res.ok) data = await res.json();
      if (!data || data.length === 0) {
        // try by id
        res = await fetch(`/api/inventory/${encodeURIComponent(value)}`);
        if (res.ok) {
          const single = await res.json();
          data = single ? [single] : [];
        }
      }
      if (!data || data.length === 0) {
        setProduct(null);
        setError('Product not found');
        return;
      }
      setProduct(data[0]);
    } catch (err) {
      setError('Failed to fetch product');
      setProduct(null);
    }
  }

  async function onDetected(value) {
    await lookupProduct(value);
  }

  async function handleManualSearch(e) {
    e.preventDefault();
    if (!manualInput.trim()) {
      setError('Please enter a barcode or product ID');
      return;
    }
    await lookupProduct(manualInput.trim());
    setManualInput('');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Barcode Scanner</h1>

      {/* Mode Selection */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setScanMode('manual')}
          className={`px-6 py-2 rounded font-semibold ${
            scanMode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          📝 Manual Input
        </button>
        <button
          onClick={() => setScanMode('camera')}
          className={`px-6 py-2 rounded font-semibold ${
            scanMode === 'camera'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          📷 Camera Scan
        </button>
      </div>

      {/* Manual Input Mode */}
      {scanMode === 'manual' && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Enter Barcode or Product ID</h2>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter barcode or product ID..."
              className="flex-1 border px-3 py-2 rounded"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Camera Scan Mode */}
      {scanMode === 'camera' && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Scan with Camera</h2>
          <BarcodeScanner onDetected={onDetected} />
        </div>
      )}

      {/* Results Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Result</h2>
        {scanned && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-semibold">Scanned/Searched:</span> {scanned}
          </div>
        )}
        {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
        {product && (
          <div className="mt-4 border p-4 rounded bg-green-50">
            <h3 className="text-2xl font-bold">{product.title || product.name}</h3>
            {product.subtitle && <p className="text-sm text-gray-600 mb-2">{product.subtitle}</p>}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <span className="font-semibold">Price:</span> ${Number(product.price).toFixed(2)}
              </div>
              <div>
                <span className="font-semibold">Stock:</span> {product.stockQuantity}
              </div>
              {product.sku && (
                <div>
                  <span className="font-semibold">SKU:</span> {product.sku}
                </div>
              )}
              {product.barcode && (
                <div>
                  <span className="font-semibold">Barcode:</span> {product.barcode}
                </div>
              )}
            </div>
            {product.image && (
              <div className="mt-4">
                <img src={product.image} alt={product.name} className="h-32 rounded" />
              </div>
            )}
            {product.description && <p className="mt-4 text-gray-700">{product.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
