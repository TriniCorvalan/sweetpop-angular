import { CandyCategory, CandySize } from './candy.model';

/**
 * Producto del inventario con stock y datos editables por admin.
 * @usageNotes Hoy se persiste en localStorage; la misma forma servirá con json-server.
 */
export interface InventoryItem {
  productId: string;
  name: string;
  category: CandyCategory;
  size: CandySize;
  price: number;
  image: string;
  stock: number;
}

/** Campos editables de un ítem (sin `productId`, que actúa como id estable). */
export type InventoryItemUpdate = Omit<InventoryItem, 'productId'>;
