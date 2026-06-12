import { BoxId } from './box.model';
import { BoxWallAssignment } from './box-draft.model';

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
