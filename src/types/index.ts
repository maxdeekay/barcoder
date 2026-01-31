export interface ScannedItem {
  barcode: string;
  quantity: number;
  firstScannedAt: string;
  defect?: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  items: ScannedItem[];
}
