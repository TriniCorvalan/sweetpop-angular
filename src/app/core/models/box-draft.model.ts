import { BoxId } from './box.model';
import { CandySize } from './candy.model';

export interface BoxWallAssignment {
  wallIndex: number;
  productId: string | null;
  productName: string | null;
  price: number | null;
  size: CandySize | null;
  quantity: number | null;
}

export interface BoxDraft {
  boxId: BoxId;
  boxName: string;
  wallsCount: number;
  boxPrice: number;
  discount: number;
  walls: BoxWallAssignment[];
}
