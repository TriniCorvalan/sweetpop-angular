import { Injectable } from '@angular/core';

import { INITIAL_STOCK, STORAGE_KEYS } from '../constants/storage-keys';
import { CANDY_CATALOG } from '../data/candy-catalog';
import { CandyCategory } from '../models/candy.model';
import { InventoryItem, InventoryItemUpdate } from '../models/inventory-item.model';
import { StorageService } from './storage.service';

const CATEGORY_ID_PREFIX: Record<CandyCategory, string> = {
  gomitas: 'gom',
  chocolate: 'cho',
  caramelos: 'car',
  barritas: 'bar',
};

const DEFAULT_DISCOUNT = 0;

/**
 * Servicio de persistencia y consulta del inventario de dulces.
 * @usageNotes Hoy usa `localStorage`; la API CRUD facilita migrar a json-server.
 * Es la fuente de productos visibles en categorías y stock.
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private readonly storage: StorageService) {}

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
      description: candy.description,
      discount: candy.discount,
      stock: INITIAL_STOCK,
    }));

    this.saveInventory(inventory);
  }

  /**
   * Completa o sincroniza campos de catálogo en ítems ya persistidos.
   * @returns void
   * @usageNotes Ejecutado en el `APP_INITIALIZER` tras `ensureInventory`.
   * Rellena `description`/`discount` faltantes y alinea tamaño con el seed.
   */
  syncInventoryFromCatalog(): void {
    const inventory = this.getInventory();
    if (inventory.length === 0) {
      return;
    }

    let changed = false;
    inventory.forEach((item, index) => {
      const seed = CANDY_CATALOG.find((entry) => entry.id === item.productId);
      const normalized = this.normalizeItem(item, seed);

      if (!this.areItemsEqual(item, normalized)) {
        inventory[index] = normalized;
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
      ...this.toUpdatePayload(item),
      stock: Math.max(0, newStock),
    });
  }

  /**
   * Actualiza los datos editables de un producto del inventario.
   * @param productId Id estable del producto.
   * @param updates Campos a persistir (incluye descripción y descuento).
   * @returns `false` si el producto no existe.
   * @usageNotes Usado en el detalle de inventario. Con json-server será un PUT/PATCH.
   */
  updateItem(productId: string, updates: InventoryItemUpdate): boolean {
    const inventory = this.getInventory();
    const index = inventory.findIndex((item) => item.productId === productId);

    if (index === -1) {
      return false;
    }

    inventory[index] = this.buildItem(productId, updates);
    this.saveInventory(inventory);
    return true;
  }

  /**
   * Agrega un producto nuevo al inventario.
   * @param data Datos del producto (sin `productId`; se genera automáticamente).
   * @returns Ítem creado o `null` si el nombre queda vacío.
   * @usageNotes Usado en el formulario de alta. Con json-server será un POST.
   */
  createItem(data: InventoryItemUpdate): InventoryItem | null {
    const name = data.name.trim();
    if (!name) {
      return null;
    }

    const inventory = this.getInventory();
    const productId = this.buildUniqueProductId(name, data.category, inventory);
    const item = this.buildItem(productId, { ...data, name });

    inventory.push(item);
    this.saveInventory(inventory);
    return item;
  }

  /**
   * Elimina un producto del inventario.
   * @param productId Id del producto a eliminar.
   * @returns `false` si el producto no existe.
   * @usageNotes Usado en detalle/listado de inventario. Con json-server será un DELETE.
   */
  deleteItem(productId: string): boolean {
    const inventory = this.getInventory();
    const next = inventory.filter((item) => item.productId !== productId);

    if (next.length === inventory.length) {
      return false;
    }

    this.saveInventory(next);
    return true;
  }

  private buildItem(productId: string, data: InventoryItemUpdate): InventoryItem {
    return {
      productId,
      name: data.name.trim(),
      category: data.category,
      size: data.size,
      price: Math.max(0, data.price),
      image: data.image.trim(),
      description: data.description.trim(),
      discount: Math.max(0, Number(data.discount) || 0),
      stock: Math.max(0, data.stock),
    };
  }

  private toUpdatePayload(item: InventoryItem): InventoryItemUpdate {
    const { productId: _productId, ...rest } = item;
    return rest;
  }

  private normalizeItem(
    item: InventoryItem,
    seed?: (typeof CANDY_CATALOG)[number],
  ): InventoryItem {
    return {
      productId: item.productId,
      name: item.name,
      category: item.category,
      size: seed && item.size !== seed.size ? seed.size : item.size,
      price: item.price,
      image: item.image,
      description: item.description?.trim()
        ? item.description
        : (seed?.description ?? `Dulce de la categoría ${item.category}.`),
      discount: this.resolveDiscount(item, seed),
      stock: item.stock,
    };
  }

  private resolveDiscount(
    item: InventoryItem,
    seed?: (typeof CANDY_CATALOG)[number],
  ): number {
    const legacy = item as InventoryItem & { discountLabel?: string };

    if (typeof legacy.discount === 'number' && !Number.isNaN(legacy.discount)) {
      return Math.max(0, legacy.discount);
    }

    if (typeof legacy.discountLabel === 'string') {
      return this.parseLegacyDiscountLabel(legacy.discountLabel);
    }

    return seed?.discount ?? DEFAULT_DISCOUNT;
  }

  private parseLegacyDiscountLabel(label: string): number {
    const trimmed = label.trim().toLowerCase();
    if (!trimmed || trimmed === 'no disponible') {
      return DEFAULT_DISCOUNT;
    }

    const match = trimmed.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.max(0, Number(match[1])) : DEFAULT_DISCOUNT;
  }

  private areItemsEqual(a: InventoryItem, b: InventoryItem): boolean {
    return (
      a.productId === b.productId &&
      a.name === b.name &&
      a.category === b.category &&
      a.size === b.size &&
      a.price === b.price &&
      a.image === b.image &&
      a.description === b.description &&
      a.discount === b.discount &&
      a.stock === b.stock
    );
  }

  private buildUniqueProductId(
    name: string,
    category: CandyCategory,
    inventory: InventoryItem[],
  ): string {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const base = `${CATEGORY_ID_PREFIX[category]}-${slug || 'producto'}`;
    let candidate = base;
    let suffix = 2;

    while (inventory.some((item) => item.productId === candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }
}
