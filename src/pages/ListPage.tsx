import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ItemRow } from "../components/ItemRow";
import { BarcodeScanner } from "../components/BarcodeScanner";
import { useLists } from "../hooks/useLists";
import { isValidBarcode } from "../utils/barcode";
import { lookupProduct, type ProductInfo } from "../utils/productLookup";
import { playScanSound } from "../utils/sound";

export function ListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getList, addItem, removeItem, updateQuantity } = useLists();
  const [manualBarcode, setManualBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});

  const list = getList(id!);

  // Look up product info for any items we haven't resolved yet
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

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  const handleScan = useCallback(
    (barcode: string) => {
      if (!list) return;
      if (!isValidBarcode(barcode)) {
        setScanning(false);
        showError(`Invalid barcode: ${barcode}`);
        return;
      }
      addItem(list.id, barcode);
      playScanSound();
      setScanning(false);
      setLastScanned(barcode);
      setTimeout(() => setLastScanned(null), 1500);
    },
    [list, addItem],
  );

  if (!list) {
    return (
      <Layout title="Not found">
        <p
          style={{
            color: "var(--color-text-secondary)",
            textAlign: "center",
            marginTop: 48,
          }}
        >
          List not found
        </p>
      </Layout>
    );
  }

  const totalItems = list.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualBarcode.trim();
    if (!trimmed) return;
    if (!isValidBarcode(trimmed)) {
      showError(
        "Invalid barcode. Must be a valid EAN-13, EAN-8, or UPC-A code.",
      );
      return;
    }
    addItem(list.id, trimmed);
    playScanSound();
    setManualBarcode("");
    setLastScanned(trimmed);
    setTimeout(() => setLastScanned(null), 1500);
  };

  return (
    <>
      <Layout title={list.name}>
        {/* Error popup */}
        {error && (
          <div
            onClick={() => setError(null)}
            style={{
              background: "var(--color-error-bg)",
              border: "1px solid var(--color-error-border)",
              borderRadius: "var(--radius)",
              padding: "12px 16px",
              marginBottom: 16,
              color: "var(--color-error-text)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {error}
          </div>
        )}

        {/* Manual Entry */}
        <form
          onSubmit={handleManualAdd}
          style={{ display: "flex", gap: 8, marginBottom: 16 }}
        >
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter barcode..."
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ flexShrink: 0 }}
          >
            Add
          </button>
        </form>

        {/* Summary bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            color: "var(--color-text-secondary)",
            fontSize: "0.875rem",
          }}
        >
          <span>
            {list.items.length} unique · {totalItems} total
          </span>
          {totalItems > 0 && (
            <button
              className="btn-primary"
              onClick={() => navigate(`/list/${list.id}/sync`)}
              style={{ fontSize: "0.875rem", padding: "8px 16px" }}
            >
              Show barcodes ({totalItems})
            </button>
          )}
        </div>

        {/* Item list */}
        {list.items.length === 0 ? (
          <p
            style={{
              color: "var(--color-text-secondary)",
              textAlign: "center",
              marginTop: 48,
            }}
          >
            No items scanned yet. Enter a barcode above or use the scanner.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingBottom: 80,
            }}
          >
            {list.items.map((item) => (
              <ItemRow
                key={item.barcode}
                barcode={item.barcode}
                quantity={item.quantity}
                product={products[item.barcode]}
                defect={item.defect}
                onUpdateQuantity={(delta) =>
                  updateQuantity(list.id, item.barcode, delta)
                }
                onRemove={() => removeItem(list.id, item.barcode)}
                highlight={item.barcode === lastScanned}
              />
            ))}
          </div>
        )}

        {/* Floating scan button */}
        <button
          className="btn-primary"
          onClick={() => setScanning(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 20,
            left: 20,
            padding: "16px 24px",
            fontSize: "1.1rem",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
          }}
        >
          Scan barcode
        </button>
      </Layout>

      {scanning && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScanning(false)}
        />
      )}
    </>
  );
}
