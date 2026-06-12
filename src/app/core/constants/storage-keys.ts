import { BoxId } from '../models/box.model';
import { CandySize } from '../models/candy.model';

export const STORAGE_KEYS = {
  users: 'sweetpop_users',
  session: 'sweetpop_session',
  inventory: 'sweetpop_inventory',
  cart: 'sweetpop_cart',
  boxDraft: 'sweetpop_box_draft',
} as const;

export const INITIAL_STOCK = 20;

export const SIZE_COMPATIBILITY: Record<CandySize, BoxId[]> = {
  small: ['box-simple', 'box-double', 'box-triple'],
  medium: ['box-simple', 'box-double', 'box-triple'],
  large: ['box-double', 'box-triple'],
};

export const WALL_QUANTITY_BY_SIZE: Record<CandySize, number> = {
  small: 10,
  medium: 7,
  large: 4,
};

export const CATEGORY_LABELS = {
  gomitas: 'Gomitas',
  chocolate: 'Chocolate',
  caramelos: 'Caramelos',
  barritas: 'Barritas',
} as const;
