import { BoxId } from './box.model';
import { CandySize } from './candy.model';

/**
 * Asignación de un dulce a una pared del borrador.
 * @usageNotes Campos nulos indican pared sin dulce asignado aún.
 */
export interface BoxWallAssignment {
  wallIndex: number;
  productId: number | null;
  productName: string | null;
  price: number | null;
  size: CandySize | null;
  quantity: number | null;
}

/**
 * Borrador de caja en personalización, persistido en sessionStorage.
 * @usageNotes Gestionado por {@link BoxDraftService}; clave `STORAGE_KEYS.boxDraft`.
 */
export interface BoxDraft {
  boxId: BoxId;
  boxName: string;
  wallsCount: number;
  boxPrice: number;
  discount: number;
  walls: BoxWallAssignment[];
}
