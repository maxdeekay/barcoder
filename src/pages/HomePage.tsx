import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useLists } from "../hooks/useLists";
import { useCards } from "../hooks/useCards";

export function HomePage() {
  const { lists, createList, deleteList } = useLists();
  const { cards, addCard, deleteCard } = useCards();
  const [name, setName] = useState("");
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardBarcode, setCardBarcode] = useState("");
  const navigate = useNavigate();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = createList(trimmed);
    setName("");
    navigate(`/list/${list.id}`);
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this list?")) {
      deleteList(id);
    }
  }

  function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = cardName.trim();
    const trimmedBarcode = cardBarcode.trim();
    if (!trimmedName || !trimmedBarcode) return;
    addCard(trimmedName, trimmedBarcode);
    setCardName("");
    setCardBarcode("");
    setShowCardForm(false);
  }

  function handleDeleteCard(id: string) {
    if (window.confirm("Delete this card?")) {
      deleteCard(id);
    }
  }

  const itemCount = (list: { items: { quantity: number }[] }) =>
    list.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout
      title="Barcoder"
      info={
        <>
          <span>
            Scan barcodes with your phone, then display them one at a time for
            the store scanner to read.
          </span>
          <br />
          <br />
          <span>
            You can also save membership IDs or personal identification numbers
            for quicker checkout. Everything is stored locally in your browser.
          </span>
        </>
      }
    >
      {/* My cards section */}
      {(cards.length > 0 || showCardForm) && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            memberships
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(`/card/${card.id}`)}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {card.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {card.barcode}
                  </div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
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
            ))}
          </div>
          {showCardForm && (
            <form
              onSubmit={handleAddCard}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 8,
              }}
            >
              <input
                type="text"
                placeholder="Name ..."
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Number ..."
                value={cardBarcode}
                onChange={(e) => setCardBarcode(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Save membership
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowCardForm(false);
                    setCardName("");
                    setCardBarcode("");
                  }}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Add card button (when no form is shown) */}
      {!showCardForm && (
        <button
          className="btn-ghost"
          onClick={() => setShowCardForm(true)}
          style={{
            width: "100%",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius)",
            padding: "10px 16px",
            fontSize: "0.85rem",
            marginBottom: 24,
            color: "var(--color-text-secondary)",
          }}
        >
          + Add membership
        </button>
      )}

      {/* Lists section */}
      <div
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        Shopping lists
      </div>

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          type="text"
          placeholder="New list name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
          Create
        </button>
      </form>

      {lists.length === 0 && (
        <p
          style={{
            color: "var(--color-text-secondary)",
            textAlign: "center",
            marginTop: 32,
            fontSize: "0.9rem",
          }}
        >
          No lists yet. Create one to get started.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {lists.map((list) => (
          <div
            key={list.id}
            onClick={() => navigate(`/list/${list.id}`)}
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{list.name}</div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                {itemCount(list)} items ·{" "}
                {new Date(list.createdAt).toISOString().slice(0, 10)}
              </div>
            </div>
            <button
              className="btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(list.id);
              }}
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
        ))}
      </div>
    </Layout>
  );
}
