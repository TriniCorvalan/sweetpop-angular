import { BoxId } from './box.model';
import { BoxWallAssignment } from './box-draft.model';

/**
 * Caja personalizada completa agregada al carrito.
 * @usageNotes Persistida en `localStorage` bajo `STORAGE_KEYS.cart`.
 */
export interface CartItem {
  cartItemId: string;
  boxId: BoxId;
  boxName: string;
  boxPrice: number;
  discount: number;
  walls: BoxWallAssignment[];
  candiesSubtotal: number;
  total: number;
}
