/** Categoría interna de un dulce en el catálogo. @usageNotes Valores: gomitas, chocolate, caramelos, barritas. */
export type CandyCategory = 'gomitas' | 'chocolate' | 'caramelos' | 'barritas';

/**
 * Tamaño físico del dulce; determina compatibilidad con cajas y unidades por pared.
 * @usageNotes Valores: `small`, `medium`, `large`. Ver `SIZE_COMPATIBILITY` y `WALL_QUANTITY_BY_SIZE`.
 */
export type CandySize = 'small' | 'medium' | 'large';

/**
 * Dulce disponible para personalización de cajas.
 * @usageNotes Proviene del inventario (id numérico de json-server).
 */
export interface Candy {
  id: number;
  name: string;
  category: CandyCategory;
  size: CandySize;
  price: number;
  image: string;
  description: string;
  /** Descuento en porcentaje (0 = sin descuento). */
  discount: number;
}
