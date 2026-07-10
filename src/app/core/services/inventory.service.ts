import { Injectable } from '@angular/core';

import { INITIAL_STOCK, STORAGE_KEYS } from '../constants/storage-keys';
import { CANDY_CATALOG } from '../data/candy-catalog';
import { InventoryItem, InventoryItemUpdate } from '../models/inventory-item.model';
import { CatalogService } from './catalog.service';
import { StorageService } from './storage.service';

/**
 * Servicio de persistencia y consulta del inventario de dulces.
 * @usageNotes Hoy usa `localStorage`; la API CRUD facilita migrar a json-server.
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(
    private readonly storage: StorageService,
    private readonly catalog: CatalogService,
  ) {}

  /**
   * Crea el inventario inicial desde el catálogo si no hay datos guardados.
   * @returns void
   * @usageNotes Ejecutado en el `APP_INITIALIZER` con stock `INITIAL_STOCK`.
   */
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

  /**
   * Sincroniza tamaños del inventario si cambió el catálogo base.
   * @returns void
   * @usageNotes Ejecutado en el `APP_INITIALIZER` tras `ensureInventory`.
   */
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

  /**
   * Obtiene el inventario completo.
   * @returns Lista de ítems de inventario.
   * @usageNotes Consumido por la página Inventory (admin). Con json-server será un GET.
   */
  getInventory(): InventoryItem[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.inventory, []);
  }

  /**
   * Persiste el inventario completo.
   * @param inventory Ítems a guardar.
   * @returns void
   * @usageNotes Sobrescribe el inventario en localStorage.
   */
  saveInventory(inventory: InventoryItem[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.inventory, inventory);
  }

  /**
   * Busca un ítem de inventario por productId.
   * @param productId Id del dulce en el catálogo.
   * @returns Ítem encontrado o `undefined`.
   * @usageNotes Usado por detalle de inventario, `getStock` y actualizaciones.
   */
  getInventoryItem(productId: string): InventoryItem | undefined {
    return this.getInventory().find((item) => item.productId === productId);
  }

  /**
   * Retorna las unidades disponibles de un dulce.
   * @param productId Id del dulce en el catálogo.
   * @returns Stock disponible; `0` si no existe en inventario.
   * @usageNotes Consultado al asignar dulces al borrador y al pagar el carrito.
   */
  getStock(productId: string): number {
    const item = this.getInventoryItem(productId);
    return item ? item.stock : 0;
  }

  /**
   * Actualiza el stock de un dulce (mínimo 0).
   * @param productId Id del dulce en el catálogo.
   * @param newStock Nuevo stock a persistir.
   * @returns `false` si el producto no existe en inventario.
   * @usageNotes Usado al procesar pago del carrito.
   */
  updateStock(productId: string, newStock: number): boolean {
    const item = this.getInventoryItem(productId);
    if (!item) {
      return false;
    }

    return this.updateItem(productId, {
      name: item.name,
      category: item.category,
      size: item.size,
      price: item.price,
      image: item.image,
      stock: Math.max(0, newStock),
    });
  }

  /**
   * Actualiza los datos editables de un producto del inventario.
   * @param productId Id estable del producto.
   * @param updates Campos a persistir (nombre, categoría, tamaño, precio, imagen, stock).
   * @returns `false` si el producto no existe.
   * @usageNotes Usado en el detalle de inventario. Con json-server será un PUT/PATCH.
   */
  updateItem(productId: string, updates: InventoryItemUpdate): boolean {
    const inventory = this.getInventory();
    const index = inventory.findIndex((item) => item.productId === productId);

    if (index === -1) {
      return false;
    }

    inventory[index] = {
      productId,
      name: updates.name.trim(),
      category: updates.category,
      size: updates.size,
      price: Math.max(0, updates.price),
      image: updates.image.trim(),
      stock: Math.max(0, updates.stock),
    };
    this.saveInventory(inventory);
    return true;
  }
}
