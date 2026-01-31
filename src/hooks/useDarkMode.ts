import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

function getSystemPreference(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useDarkMode() {
  // null means "no manual override, follow system"
  const [preference, setPreference] = useLocalStorage<boolean | null>(
    "barcoder-dark-mode",
    null,
  );

  const dark = preference ?? getSystemPreference();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
  }, [dark]);

  // Listen for system theme changes when no manual override is set
  useEffect(() => {
    if (preference !== null) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute(
        "data-theme",
        mq.matches ? "dark" : "light",
      );
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const toggle = () =>
    setPreference((prev) => !(prev ?? getSystemPreference()));

  return [dark, toggle] as const;
}
