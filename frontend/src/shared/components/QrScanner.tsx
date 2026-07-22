import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { Button } from './Button';
import { AlertBanner } from './AlertBanner';

interface QrScannerProps {
  /** Called with the decoded text when a QR code is successfully scanned. */
  onScan: (value: string) => void;
  /** Called when the user closes the scanner without scanning. */
  onClose: () => void;
  /** Optional hook for surfacing camera errors to the parent. */
  onError?: (message: string) => void;
}

/**
 * Reusable camera-based QR code scanner. Renders a live camera preview and
 * invokes `onScan` with the decoded text on the first successful read.
 *
 * Requires a secure context (HTTPS or localhost) for camera access; when the
 * camera is unavailable or permission is denied, a friendly error is shown and
 * the caller can fall back to manual entry.
 */
export function QrScanner({ onScan, onClose, onError }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const scannedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callbacks in refs so the camera effect can run exactly once
  // (referencing the props directly would restart the stream on every render).
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'Camera not available. Camera access requires a secure (HTTPS) connection.';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    // Acquire the stream and attach/decode as two steps so React StrictMode's
    // throwaway first mount cleans up its OWN stream without ever touching the
    // shared <video> element (avoids a black preview on the surviving mount).
    let stopped = false;
    let stream: MediaStream | null = null;
    const reader = new BrowserQRCodeReader();

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then(async (obtained) => {
        stream = obtained;
        if (stopped) {
          obtained.getTracks().forEach((t) => t.stop());
          return;
        }
        const controls = await reader.decodeFromStream(obtained, videoRef.current!, (result) => {
          if (result && !scannedRef.current) {
            scannedRef.current = true;
            controlsRef.current?.stop();
            onScanRef.current(result.getText());
          }
        });
        controlsRef.current = controls;
        // Stop now if teardown or a scan already happened before controls were
        // assigned (the decode callback can fire before this promise resolves).
        if (stopped || scannedRef.current) controls.stop();
      })
      .catch((e) => {
        if (stopped) return;
        const msg =
          e instanceof DOMException && e.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access or enter the card ID manually.'
            : 'Unable to start the camera. Please enter the card ID manually.';
        setError(msg);
        onErrorRef.current?.(msg);
      });

    return () => {
      stopped = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Scan QR code"
      data-testid="qr-scanner"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h2>
        <p className="text-sm text-gray-500 mb-4">Point the camera at the neighbour's QR code.</p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <div className="overflow-hidden rounded-md bg-black aspect-square">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            data-testid="qr-scanner-video"
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="secondary" type="button" onClick={onClose} data-testid="qr-scanner-cancel">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
