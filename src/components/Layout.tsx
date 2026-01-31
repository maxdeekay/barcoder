import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";

export function Layout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [dark, toggleDark] = useDarkMode();

  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {!isHome && (
          <button
            className="btn-ghost"
            onClick={() => navigate("/")}
            style={{
              fontSize: "1.2rem",
              minHeight: "auto",
              padding: "4px 8px",
            }}
          >
            ←
          </button>
        )}
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, flex: 1 }}>
          {title}
        </h1>
        <button
          className="btn-ghost"
          onClick={toggleDark}
          style={{
            fontSize: "1.2rem",
            minHeight: "auto",
            padding: "4px 8px",
          }}
          aria-label="Toggle dark mode"
        >
          {dark ? "☀" : "☾"}
        </button>
      </header>
      <main style={{ flex: 1, padding: 16 }}>{children}</main>
    </div>
  );
}
