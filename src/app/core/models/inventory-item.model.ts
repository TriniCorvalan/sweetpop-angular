import { CandyCategory, CandySize } from './candy.model';

/**
 * Producto del inventario con stock persistido en localStorage.
 * @usageNotes Derivado del catálogo de dulces con campo `stock` editable por admin.
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
