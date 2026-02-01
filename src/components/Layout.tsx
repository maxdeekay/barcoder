import { type ReactNode, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";

export function Layout({
  title,
  info,
  children,
}: {
  title: string;
  info?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [dark, toggleDark] = useDarkMode();
  const [showInfo, setShowInfo] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInfo) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      )
        return;
      setShowInfo(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showInfo]);

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
        {info && (
          <div ref={btnRef}>
            <button
              className="btn-ghost"
              onClick={() => setShowInfo((s) => !s)}
              style={{
                fontSize: "1rem",
                minHeight: "auto",
                padding: "4px 8px",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "1px solid var(--color-border)",
                fontWeight: 700,
              }}
              aria-label="About this app"
            >
              ?
            </button>
          </div>
        )}
        {info && showInfo && (
          <div
            ref={popoverRef}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 16,
              left: 16,
              zIndex: 20,
            }}
          >
            <div
              style={{
                marginLeft: "auto",
                maxWidth: 300,
                width: "100%",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                padding: "12px 14px",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {info}
            </div>
          </div>
        )}
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
