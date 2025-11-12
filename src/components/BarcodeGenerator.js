import { useEffect, useRef } from 'react';

// BarcodeGenerator: renders a Code128 barcode into an SVG using JsBarcode
export default function BarcodeGenerator({ value, format = 'CODE128', options = {}, className = '' }) {
  const svgRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function renderBarcode() {
      if (!value) return;
      // load JsBarcode dynamically to avoid SSR issues
      const JsBarcode = (await import('jsbarcode')).default || (await import('jsbarcode'));
      try {
        if (!mounted) return;
        const svg = svgRef.current;
        if (!svg) return;
        // Clear previous
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        const innerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.appendChild(innerSvg);
        JsBarcode(innerSvg, String(value), {
          format,
          displayValue: true,
          fontOptions: 'bold',
          fontSize: 14,
          height: 60,
          margin: 10,
          ...options,
        });
      } catch (err) {
        console.error('Failed to render barcode', err);
      }
    }
    renderBarcode();
    return () => { mounted = false; };
  }, [value, format, options]);

  function downloadSVG() {
    const svg = svgRef.current?.innerHTML;
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${value}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`barcode-generator ${className}`}>
      <div ref={svgRef} />
      <div className="mt-2 flex gap-2">
        <button onClick={downloadSVG} className="bg-blue-500 text-white px-3 py-1 rounded">Download SVG</button>
        <button onClick={() => navigator.clipboard?.writeText(String(value))} className="bg-gray-200 px-3 py-1 rounded">Copy Value</button>
      </div>
    </div>
  );
}
