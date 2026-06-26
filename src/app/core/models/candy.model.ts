/** Categoría interna de un dulce en el catálogo. @usageNotes Valores: gomitas, chocolate, caramelos, barritas. */
export type CandyCategory = 'gomitas' | 'chocolate' | 'caramelos' | 'barritas';

/**
 * Tamaño físico del dulce; determina compatibilidad con cajas y unidades por pared.
 * @usageNotes Valores: `small`, `medium`, `large`. Ver `SIZE_COMPATIBILITY` y `WALL_QUANTITY_BY_SIZE`.
 */
export type CandySize = 'small' | 'medium' | 'large';

/**
 * Dulce disponible en el catálogo estático.
 * @usageNotes Definido en `CANDY_CATALOG`; no incluye stock (ver `InventoryItem`).
 */
export interface Candy {
  id: string;
  name: string;
  category: CandyCategory;
  size: CandySize;
  price: number;
  image: string;
  description: string;
  discountLabel: string;
}
