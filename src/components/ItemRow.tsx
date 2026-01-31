import type { ProductInfo } from "../utils/productLookup";

interface ItemRowProps {
  barcode: string;
  quantity: number;
  product?: ProductInfo | null;
  defect?: boolean;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
  highlight?: boolean;
}

export function ItemRow({
  barcode,
  quantity,
  product,
  defect,
  onUpdateQuantity,
  onRemove,
  highlight,
}: ItemRowProps) {
  const borderColor = defect
    ? "var(--color-danger)"
    : highlight
      ? "var(--color-highlight-border)"
      : "var(--color-border)";

  const bgColor = defect
    ? "var(--color-error-bg)"
    : highlight
      ? "var(--color-highlight-bg)"
      : "var(--color-surface)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: bgColor,
        borderRadius: "var(--radius)",
        border: `1px solid ${borderColor}`,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Product image */}
      {product?.imageUrl ? (
        <img
          src={product.imageUrl}
          alt=""
          style={{
            width: 44,
            height: 44,
            objectFit: "contain",
            borderRadius: 6,
            flexShrink: 0,
            background: "var(--color-placeholder)",
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            flexShrink: 0,
            background: "var(--color-placeholder)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            color: "var(--color-text-secondary)",
          }}
        >
          ?
        </div>
      )}

      {/* Name + barcode */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {defect && (
            <span style={{ color: "var(--color-danger)", marginRight: 4 }}>
              !!
            </span>
          )}
          {product?.name || barcode}
        </div>
        {product?.name && (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}
          >
            {barcode}
          </div>
        )}
        {defect && (
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--color-danger)",
              marginTop: 2,
              fontWeight: 500,
            }}
          >
            Needs manual scan
          </div>
        )}
      </div>

      {/* Quantity controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          className="btn-ghost"
          onClick={() => onUpdateQuantity(-1)}
          style={{
            width: 36,
            height: 36,
            minHeight: 36,
            padding: 0,
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
        >
          −
        </button>
        <span
          style={{
            minWidth: 32,
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          {quantity}
        </span>
        <button
          className="btn-ghost"
          onClick={() => onUpdateQuantity(1)}
          style={{
            width: 36,
            height: 36,
            minHeight: 36,
            padding: 0,
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
        >
          +
        </button>
      </div>

      {/* Delete */}
      <button
        className="btn-ghost"
        onClick={onRemove}
        style={{
          width: 36,
          height: 36,
          minHeight: 36,
          padding: 0,
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-danger)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
        }}
      >
        ✕
      </button>
    </div>
  );
}
