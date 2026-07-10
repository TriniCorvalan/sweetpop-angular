import { CandyCategory, CandySize } from './candy.model';

/**
 * Producto del inventario: mismos datos de catálogo más stock editable.
 * @usageNotes Forma alineada con json-server (`id` numérico); espejo en localStorage.
 */
export interface InventoryItem {
  id: number;
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

/** Campos editables de un ítem (sin `id`, generado por json-server). */
export type InventoryItemUpdate = Omit<InventoryItem, 'id'>;
