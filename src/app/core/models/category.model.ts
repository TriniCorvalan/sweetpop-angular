import { CandyCategory } from './candy.model';

export interface Category {
  category: CandyCategory;
  route: string;
  image: string;
  description: string;
  discountLabel: string;
  linkLabel: string;
}
