import { useState, useMemo, useEffect, useRef } from "react";
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
  const [flash, setFlash] = useState(false);
  const animatingRef = useRef(false);

  useWakeLock();

  useEffect(() => {
    if (!list) return;
    const initial = new Set<string>();
    for (const item of list.items) {
      if (item.defect) initial.add(item.barcode);
    }
    setDefects(initial);
  }, [list]);

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

  const flatBarcodes = useMemo(() => {
    if (!list) return [];
    return list.items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => item.barcode),
    );
  }, [list]);

  const goNext = () => {
    if (animatingRef.current) return;
    if (currentIndex >= flatBarcodes.length - 1) {
      navigate(`/list/${list!.id}`);
      return;
    }
    animatingRef.current = true;
    setFlash(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setFlash(false);
      animatingRef.current = false;
    }, 150);
  };

  const goPrev = () => {
    if (animatingRef.current || currentIndex <= 0) return;
    animatingRef.current = true;
    setFlash(true);
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
      setFlash(false);
      animatingRef.current = false;
    }, 150);
  };

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
        <p style={{ color: "#64748b", marginBottom: 16 }}>List not found.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const toggleDefect = (barcode: string) => {
    const next = new Set(defects);
    if (next.has(barcode)) {
      next.delete(barcode);
      markDefect(list.id, barcode, false);
    } else {
      next.add(barcode);
      markDefect(list.id, barcode, true);
    }
    setDefects(next);
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
        <p style={{ color: "#64748b", marginBottom: 16 }}>No items to sync.</p>
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
  const isDefect = defects.has(barcode);

  const bgColor = flash
    ? isDefect
      ? "#fecaca"
      : "#d1fae5"
    : isDefect
      ? "#fef2f2"
      : "#ffffff";

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

      {/* Hints */}
      <div
        style={{
          textAlign: "center",
          padding: "8px 16px",
          fontSize: "0.75rem",
          color: "#92400e",
          background: "#fffbeb",
          borderBottom: "1px solid #fde68a",
          lineHeight: 1.5,
        }}
      >
        Max brightness for best results. Tap barcode to advance.
      </div>

      {/* Barcode display — tap to go next */}
      <div
        onClick={goNext}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          gap: 8,
          background: bgColor,
          transition: flash ? "none" : "background 0.3s ease-out",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            opacity: isDefect ? 0.3 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <Barcode
            value={barcode}
            format="EAN13"
            width={3}
            height={140}
            fontSize={20}
            margin={0}
            background="transparent"
            lineColor={isDefect ? "#dc2626" : "#000000"}
          />
        </div>
        {products[barcode]?.name && (
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: isDefect ? "#dc2626" : "#0f172a",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {products[barcode].name}
          </div>
        )}
        <div
          style={{
            fontSize: "0.85rem",
            color: "#dc2626",
            fontWeight: 600,
            marginTop: 4,
            visibility: isDefect ? "visible" : "hidden",
          }}
        >
          Marked as defect — scan manually
        </div>
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
      </div>

      {/* Defect toggle + Previous */}
      <div
        style={{
          padding: "12px 20px 32px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDefect(barcode);
          }}
          style={{
            width: "100%",
            background: isDefect ? "#dc2626" : "transparent",
            border: "1px solid #dc2626",
            color: isDefect ? "#ffffff" : "#dc2626",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: "0.9rem",
            fontWeight: 500,
            cursor: "pointer",
            minHeight: 44,
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {isDefect ? "Unmark defect" : "Mark as defect"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          disabled={isFirst}
          style={{
            width: "100%",
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
      </div>
    </div>
  );
}
