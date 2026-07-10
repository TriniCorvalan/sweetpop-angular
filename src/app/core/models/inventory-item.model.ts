import { CandyCategory, CandySize } from './candy.model';

/**
 * Producto del inventario: mismos datos de catálogo más stock editable.
 * @usageNotes Fuente de verdad de dulces (seed en `CANDY_CATALOG`); listo para json-server.
 */
export interface InventoryItem {
  productId: string;
  name: string;
  category: CandyCategory;
  size: CandySize;
  price: number;
  image: string;
  description: string;
  /** Descuento en porcentaje (0 = sin descuento). */
  discount: number;
  stock: number;
}

/** Campos editables de un ítem (sin `productId`, que actúa como id estable). */
export type InventoryItemUpdate = Omit<InventoryItem, 'productId'>;
