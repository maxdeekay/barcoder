import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import { useLists } from "../hooks/useLists";
import { useWakeLock } from "../hooks/useWakeLock";
import { lookupProduct, type ProductInfo } from "../utils/productLookup";

export function SyncPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getList, markDefect } = useLists();
  const list = getList(id!);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [defects, setDefects] = useState<Set<string>>(new Set());

  // Keep screen awake during sync
  useWakeLock();

  // Initialize defects from list data
  useEffect(() => {
    if (!list) return;
    const initial = new Set<string>();
    for (const item of list.items) {
      if (item.defect) initial.add(item.barcode);
    }
    setDefects(initial);
  }, [list]);

  // Look up product info for all items
  useEffect(() => {
    if (!list) return;
    for (const item of list.items) {
      if (!(item.barcode in products)) {
        setProducts((prev) => ({
          ...prev,
          [item.barcode]: { name: null, imageUrl: null },
        }));
        lookupProduct(item.barcode).then((info) => {
          setProducts((prev) => ({ ...prev, [item.barcode]: info }));
        });
      }
    }
  }, [list, products]);

  // Flatten items: quantity 3 = barcode appears 3 times, skip defects
  const flatBarcodes = useMemo(() => {
    if (!list) return [];
    return list.items
      .filter((item) => !defects.has(item.barcode))
      .flatMap((item) =>
        Array.from({ length: item.quantity }, () => item.barcode),
      );
  }, [list, defects]);

  if (!list) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          background: "#fff",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
          List not found.
        </p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const handleDefect = (barcode: string) => {
    const next = new Set(defects);
    next.add(barcode);
    setDefects(next);
    markDefect(list.id, barcode, true);
    // Adjust index if we removed a barcode before or at current position
    if (currentIndex >= flatBarcodes.length - 1 && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  if (flatBarcodes.length === 0) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          background: "#fff",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
          {defects.size > 0
            ? "All remaining items are marked as defect."
            : "No items to sync."}
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate(`/list/${list.id}`)}
        >
          Back to list
        </button>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, flatBarcodes.length - 1);
  const barcode = flatBarcodes[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === flatBarcodes.length - 1;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#000000",
        userSelect: "none",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <button
          onClick={() => navigate(`/list/${list.id}`)}
          style={{
            background: "transparent",
            color: "#64748b",
            fontWeight: 600,
            border: "none",
            padding: "4px 8px",
            fontSize: "1rem",
            cursor: "pointer",
            minHeight: "auto",
          }}
        >
          ← Done
        </button>
        <span
          style={{
            fontSize: "0.875rem",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          {safeIndex + 1} / {flatBarcodes.length}
        </span>
      </div>

      {/* Brightness reminder */}
      <div
        style={{
          textAlign: "center",
          padding: "8px 16px",
          fontSize: "0.75rem",
          color: "#92400e",
          background: "#fffbeb",
          borderBottom: "1px solid #fde68a",
        }}
      >
        Turn screen brightness to max for best scanning results
      </div>

      {/* Barcode display — always white bg, black bars */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          gap: 8,
          background: "#ffffff",
        }}
      >
        <Barcode
          value={barcode}
          format="EAN13"
          width={3}
          height={140}
          fontSize={20}
          margin={0}
          background="#ffffff"
          lineColor="#000000"
        />
        {products[barcode]?.name && (
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#0f172a",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {products[barcode].name}
          </div>
        )}
        <div
          style={{
            fontSize: "0.8rem",
            color: "#64748b",
            marginTop: 4,
          }}
        >
          {(() => {
            const item = list.items.find((i) => i.barcode === barcode);
            if (!item || item.quantity <= 1) return null;
            let count = 0;
            for (let i = 0; i <= safeIndex; i++) {
              if (flatBarcodes[i] === barcode) count++;
            }
            return `(${count} of ${item.quantity})`;
          })()}
        </div>

        {/* Defect button */}
        <button
          onClick={() => handleDefect(barcode)}
          style={{
            marginTop: 16,
            background: "transparent",
            border: "1px solid #dc2626",
            color: "#dc2626",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            minHeight: 36,
          }}
        >
          Mark as defect
        </button>
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "16px 20px 32px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
          style={{
            flex: 1,
            border: "2px solid #e2e8f0",
            background: "transparent",
            color: isFirst ? "#cbd5e1" : "#64748b",
            opacity: isFirst ? 0.5 : 1,
            fontSize: "1.1rem",
            padding: "16px 12px",
            borderRadius: 12,
            fontWeight: 600,
            cursor: isFirst ? "default" : "pointer",
            minHeight: 44,
          }}
        >
          ← Previous
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            if (isLast) {
              navigate(`/list/${list.id}`);
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }}
          style={{
            flex: 1,
            fontSize: "1.1rem",
            padding: "16px 12px",
          }}
        >
          {isLast ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}
