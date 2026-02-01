import { useLocalStorage } from "./useLocalStorage";
import type { SavedCard } from "../types";

const STORAGE_KEY = "barcoder-cards";

export function useCards() {
  const [cards, setCards] = useLocalStorage<SavedCard[]>(STORAGE_KEY, []);

  function addCard(name: string, barcode: string): SavedCard {
    const card: SavedCard = {
      id: crypto.randomUUID(),
      name,
      barcode,
    };
    setCards((prev) => [...prev, card]);
    return card;
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return { cards, addCard, deleteCard };
}
