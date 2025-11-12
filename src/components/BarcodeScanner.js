import { useEffect, useRef, useState } from 'react';

// BarcodeScanner uses @zxing/library to scan barcodes from the device camera
export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const zxRef = useRef(null);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const ZXing = await import('@zxing/library');
  const codeReader = new ZXing.BrowserMultiFormatReader();
  codeReaderRef.current = codeReader;
  zxRef.current = ZXing;
        const devices = await codeReader.listVideoInputDevices();
        if (!mounted) return;
        if (devices && devices.length) {
          setDeviceId(devices[0].deviceId);
        }
      } catch (err) {
        console.error('Camera init failed', err);
        setError('Camera not available');
      }
    }
    init();
    return () => { mounted = false; if (codeReaderRef.current) codeReaderRef.current.reset(); };
  }, []);

  async function start() {
    setError(null);
    if (!codeReaderRef.current) return setError('Scanner not ready');
    try {
      setScanning(true);
      await codeReaderRef.current.decodeFromVideoDevice(deviceId || null, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();
          onDetected?.(text);
        }
        // Ignore NotFoundException (no barcode in frame); report other errors
        const ZX = zxRef.current;
        if (err) {
          const isNotFound = ZX && ZX.NotFoundException && err instanceof ZX.NotFoundException;
          if (!isNotFound) console.debug('ZXing error', err);
        }
      });
    } catch (err) {
      console.error('Start scanning failed', err);
      setError('Failed to start scanning');
      setScanning(false);
    }
  }

  function stop() {
    try {
      codeReaderRef.current?.reset();
    } catch (e) {
      console.error(e);
    }
    setScanning(false);
  }

  return (
    <div className="barcode-scanner">
      {error && <div className="text-red-600">{error}</div>}
      <video ref={videoRef} style={{ width: '100%', maxWidth: 640 }} />
      <div className="mt-2 flex gap-2">
        {!scanning ? (
          <button onClick={start} className="bg-green-500 text-white px-3 py-1 rounded">Start Scanning</button>
        ) : (
          <button onClick={stop} className="bg-red-500 text-white px-3 py-1 rounded">Stop</button>
        )}
      </div>
    </div>
  );
}
