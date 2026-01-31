import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastScanRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const containerId = "barcode-scanner-viewport";
    let cancelled = false;

    async function startScanner() {
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled) return;

      try {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const w = Math.max(viewfinderWidth * 0.8, 100);
              const h = Math.max(viewfinderHeight * 0.5, 50);
              return { width: w, height: h };
            },
            aspectRatio: 1,
          },
          (decodedText) => {
            const now = Date.now();
            if (
              decodedText === lastScanRef.current &&
              now - lastScanTimeRef.current < 1500
            ) {
              return;
            }
            lastScanRef.current = decodedText;
            lastScanTimeRef.current = now;

            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            onScan(decodedText);
          },
          () => {},
        );

        if (cancelled) {
          await scanner.stop();
          scanner.clear();
        } else {
          isRunningRef.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not access camera. Check permissions.",
          );
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner && isRunningRef.current) {
        isRunningRef.current = false;
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "12px 16px",
          color: "#fff",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
          Scan barcode
        </span>
      </div>

      {error ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            color: "#fff",
            textAlign: "center",
            gap: 16,
          }}
        >
          <p>{error}</p>
          <button className="btn-primary" onClick={onClose}>
            Go back
          </button>
        </div>
      ) : (
        <div id="barcode-scanner-viewport" style={{ flex: 1 }} />
      )}

      {/* Close button at bottom */}
      <div style={{ padding: "16px 20px 32px" }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "16px 24px",
            fontSize: "1.1rem",
            fontWeight: 600,
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 12,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Close scanner
        </button>
      </div>
    </div>
  );
}
