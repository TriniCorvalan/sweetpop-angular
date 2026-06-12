export type CandyCategory = 'gomitas' | 'chocolate' | 'caramelos' | 'barritas';

export type CandySize = 'small' | 'medium' | 'large';

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
