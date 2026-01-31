import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useLists } from "../hooks/useLists";

export function HomePage() {
  const { lists, createList, deleteList } = useLists();
  const [name, setName] = useState("");
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

  const itemCount = (list: { items: { quantity: number }[] }) =>
    list.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout title="Barcoder">
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-secondary)",
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        Scan barcodes with your phone, then display them one at a time for the
        store scanner to read.
      </p>

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}
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
            marginTop: 48,
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
