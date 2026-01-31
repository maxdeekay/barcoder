import { useLocalStorage } from "./useLocalStorage";
import type { ShoppingList } from "../types";

const STORAGE_KEY = "barcoder-lists";

export function useLists() {
  const [lists, setLists] = useLocalStorage<ShoppingList[]>(STORAGE_KEY, []);

  function createList(name: string): ShoppingList {
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      items: [],
    };
    setLists((prev) => [newList, ...prev]);
    return newList;
  }

  function deleteList(id: string) {
    setLists((prev) => prev.filter((list) => list.id !== id));
  }

  function getList(id: string): ShoppingList | undefined {
    return lists.find((list) => list.id === id);
  }

  function addItem(listId: string, barcode: string) {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;

        const existing = list.items.find((item) => item.barcode === barcode);
        if (existing) {
          return {
            ...list,
            items: list.items.map((item) =>
              item.barcode === barcode
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        }

        return {
          ...list,
          items: [
            ...list.items,
            {
              barcode,
              quantity: 1,
              firstScannedAt: new Date().toISOString(),
            },
          ],
        };
      }),
    );
  }

  function removeItem(listId: string, barcode: string) {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.filter((item) => item.barcode !== barcode),
        };
      }),
    );
  }

  function updateQuantity(listId: string, barcode: string, delta: number) {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items
            .map((item) =>
              item.barcode === barcode
                ? { ...item, quantity: item.quantity + delta }
                : item,
            )
            .filter((item) => item.quantity > 0),
        };
      }),
    );
  }

  function markDefect(listId: string, barcode: string, defect: boolean) {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.map((item) =>
            item.barcode === barcode ? { ...item, defect } : item,
          ),
        };
      }),
    );
  }

  return {
    lists,
    createList,
    deleteList,
    getList,
    addItem,
    removeItem,
    updateQuantity,
    markDefect,
  };
}
