import { CandyCategory, CandySize } from './candy.model';

export interface InventoryItem {
  productId: string;
  name: string;
  category: CandyCategory;
  size: CandySize;
  price: number;
  image: string;
  stock: number;
}
