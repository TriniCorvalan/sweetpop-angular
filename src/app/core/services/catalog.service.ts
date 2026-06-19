import { Injectable } from '@angular/core';

import {
  CATEGORY_LABELS,
  SIZE_COMPATIBILITY,
  WALL_QUANTITY_BY_SIZE,
} from '../constants/storage-keys';
import { BOX_CATALOG } from '../data/box-catalog';
import { CANDY_CATALOG } from '../data/candy-catalog';
import { CATEGORY_CATALOG } from '../data/category-catalog';
import { Box, BoxId } from '../models/box.model';
import { Candy, CandyCategory, CandySize } from '../models/candy.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  readonly boxes = BOX_CATALOG;
  readonly candies = CANDY_CATALOG;
  readonly categories = CATEGORY_CATALOG;

  getBoxById(boxId: string): Box | null {
    return this.boxes.find((box) => box.id === boxId) ?? null;
  }

  getCandyById(productId: string): Candy | null {
    return this.candies.find((candy) => candy.id === productId) ?? null;
  }

  getCandiesByCategory(category: CandyCategory): Candy[] {
    return this.candies.filter((candy) => candy.category === category);
  }

  isCandyCompatibleWithBox(candySize: CandySize, boxId: BoxId): boolean {
    const allowedBoxes = SIZE_COMPATIBILITY[candySize];
    return allowedBoxes?.includes(boxId) ?? false;
  }

  getWallQuantityBySize(size: CandySize): number {
    return WALL_QUANTITY_BY_SIZE[size] ?? 4;
  }

  getSizeLabel(size: CandySize): string {
    const labels: Record<CandySize, string> = {
      small: 'pequeño',
      medium: 'medio',
      large: 'grande',
    };
    return labels[size] ?? size;
  }

  getCategoryLabel(category: CandyCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  formatPrice(amount: number): string {
    return `$${Number(amount).toLocaleString('es-CL')}`;
  }

  formatDiscountPercent(discount: number): string {
    return `${Math.round(discount * 100)}%`;
  }
}
