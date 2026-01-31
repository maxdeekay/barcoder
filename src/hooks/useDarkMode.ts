import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useDarkMode() {
  const [dark, setDark] = useLocalStorage("barcoder-dark-mode", false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}
