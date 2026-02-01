import { useParams, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import { useCards } from "../hooks/useCards";
import { useWakeLock } from "../hooks/useWakeLock";

export function CardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cards } = useCards();
  const card = cards.find((c) => c.id === id);

  useWakeLock();

  if (!card) {
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
        <p style={{ color: "#64748b", marginBottom: 16 }}>Card not found.</p>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Go back
        </button>
      </div>
    );
  }

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
          justifyContent: "center",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "#0f172a" }}>
          {card.name}
        </span>
      </div>

      {/* Barcode display */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background: "#ffffff",
        }}
      >
        <Barcode
          value={card.barcode}
          format="CODE128"
          width={3}
          height={160}
          fontSize={22}
          margin={0}
          background="#ffffff"
          lineColor="#000000"
        />
      </div>

      {/* Close button */}
      <div style={{ padding: "16px 20px 32px" }}>
        <button
          className="btn-primary"
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            padding: "16px 24px",
            fontSize: "1.1rem",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
