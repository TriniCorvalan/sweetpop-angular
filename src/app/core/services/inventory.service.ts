import { Injectable } from '@angular/core';

import { INITIAL_STOCK, STORAGE_KEYS } from '../constants/storage-keys';
import { CANDY_CATALOG } from '../data/candy-catalog';
import { InventoryItem } from '../models/inventory-item.model';
import { CatalogService } from './catalog.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(
    private readonly storage: StorageService,
    private readonly catalog: CatalogService,
  ) {}

  ensureInventory(): void {
    const existing = this.storage.readJson<InventoryItem[] | null>(
      localStorage,
      STORAGE_KEYS.inventory,
      null,
    );

    if (existing !== null && Array.isArray(existing) && existing.length > 0) {
      return;
    }

    const inventory: InventoryItem[] = CANDY_CATALOG.map((candy) => ({
      productId: candy.id,
      name: candy.name,
      category: candy.category,
      size: candy.size,
      price: candy.price,
      image: candy.image,
      stock: INITIAL_STOCK,
    }));

    this.saveInventory(inventory);
  }

  syncInventorySizesFromCatalog(): void {
    const inventory = this.getInventory();
    if (inventory.length === 0) {
      return;
    }

    let changed = false;
    inventory.forEach((item) => {
      const candy = this.catalog.getCandyById(item.productId);
      if (candy && item.size !== candy.size) {
        item.size = candy.size;
        changed = true;
      }
    });

    if (changed) {
      this.saveInventory(inventory);
    }
  }

  getInventory(): InventoryItem[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.inventory, []);
  }

  saveInventory(inventory: InventoryItem[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.inventory, inventory);
  }

  getInventoryItem(productId: string): InventoryItem | undefined {
    return this.getInventory().find((item) => item.productId === productId);
  }

  getStock(productId: string): number {
    const item = this.getInventoryItem(productId);
    return item ? item.stock : 0;
  }

  updateStock(productId: string, newStock: number): boolean {
    const inventory = this.getInventory();
    const index = inventory.findIndex((item) => item.productId === productId);

    if (index === -1) {
      return false;
    }

    inventory[index].stock = Math.max(0, newStock);
    this.saveInventory(inventory);
    return true;
  }
}
