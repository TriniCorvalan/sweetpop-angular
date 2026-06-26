import { CandyCategory } from './candy.model';

/**
 * Metadatos de una categoría de dulces para navegación y tarjetas.
 * @usageNotes Definido en `CATEGORY_CATALOG` y consumido por `CategoryCatalogCards`.
 */
export interface Category {
  category: CandyCategory;
  route: string;
  image: string;
  description: string;
  discountLabel: string;
  linkLabel: string;
}
