import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import {
  CATEGORY_LABELS,
  SIZE_COMPATIBILITY,
  WALL_QUANTITY_BY_SIZE,
} from '../constants/storage-keys';
import { CATEGORY_CATALOG } from '../data/category-catalog';
import { Box, BoxId } from '../models/box.model';
import { Candy, CandyCategory, CandySize } from '../models/candy.model';
import { InventoryItem } from '../models/inventory-item.model';
import { InventoryService } from './inventory.service';

/**
 * Servicio de consulta al catálogo y reglas de negocio.
 * @usageNotes Cajas desde DummyJSON; dulces desde inventario (mismos campos que el catálogo + stock).
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  readonly boxesUrl = 'https://dummyjson.com/c/a111-5f2a-4629-ae59';

  /** Catálogo de categorías para navegación. @usageNotes Ver `CATEGORY_CATALOG`. */
  readonly categories = CATEGORY_CATALOG;

  private readonly httpClient = inject(HttpClient);
  private readonly inventory = inject(InventoryService);

  /** Dulces disponibles según inventario actual. @usageNotes Incluye productos creados por admin. */
  get candies(): Candy[] {
    return this.inventory.getInventory().map((item) => this.mapInventoryItemToCandy(item));
  }

  /**
   * Obtiene las cajas desde DummyJSON.
   * @returns Observable con el catálogo de cajas.
   */
  getBoxes(): Observable<Box[]> {
    return this.httpClient.get<Box[]>(this.boxesUrl);
  }

  /**
   * Busca una caja por id consultando la API.
   * @param boxId Id de la caja.
   * @returns Caja encontrada o `null`.
   * @usageNotes Usado al iniciar personalización (`BoxDraftService.startBoxDraft`).
   */
  getBoxById(boxId: string): Observable<Box | null> {
    return this.getBoxes().pipe(
      map((boxes) => boxes.find((box) => box.id === boxId) ?? null),
    );
  }

  /**
   * Busca un dulce por id en el inventario.
   * @param productId Id del producto.
   * @returns Dulce encontrado o `null`.
   * @usageNotes Usado al asignar dulces a paredes del borrador.
   */
  getCandyById(productId: string): Candy | null {
    const item = this.inventory.getInventoryItem(productId);
    return item ? this.mapInventoryItemToCandy(item) : null;
  }

  /**
   * Filtra dulces del inventario por categoría.
   * @param category Id de categoría (`gomitas`, `chocolate`, etc.).
   * @returns Dulces de la categoría indicada.
   * @usageNotes Consumido por `CategoryProducts` en páginas de categoría.
   */
  getCandiesByCategory(category: CandyCategory): Candy[] {
    return this.inventory
      .getInventory()
      .filter((item) => item.category === category)
      .map((item) => this.mapInventoryItemToCandy(item));
  }

  /**
   * Indica si un dulce cabe en la caja según su tamaño.
   * @param candySize Tamaño del dulce.
   * @param boxId Id de la caja.
   * @returns `true` si la combinación es compatible.
   * @usageNotes Reglas definidas en `SIZE_COMPATIBILITY`.
   */
  isCandyCompatibleWithBox(candySize: CandySize, boxId: BoxId): boolean {
    const allowedBoxes = SIZE_COMPATIBILITY[candySize];
    return allowedBoxes?.includes(boxId) ?? false;
  }

  /**
   * Retorna unidades de dulce requeridas por pared según tamaño.
   * @param size Tamaño del dulce.
   * @returns Cantidad de unidades por pared.
   * @usageNotes Valores en `WALL_QUANTITY_BY_SIZE`.
   */
  getWallQuantityBySize(size: CandySize): number {
    return WALL_QUANTITY_BY_SIZE[size] ?? 4;
  }

  /**
   * Traduce el tamaño interno a etiqueta en español.
   * @param size Tamaño del dulce (`small`, `medium`, `large`).
   * @returns Etiqueta legible (pequeño, medio, grande).
   * @usageNotes Mostrado en tarjetas de producto e inventario.
   */
  getSizeLabel(size: CandySize): string {
    const labels: Record<CandySize, string> = {
      small: 'pequeño',
      medium: 'medio',
      large: 'grande',
    };
    return labels[size] ?? size;
  }

  /**
   * Traduce el id de categoría a nombre legible.
   * @param category Id interno de categoría.
   * @returns Nombre en español.
   * @usageNotes Usado en Inventory y tarjetas de categoría.
   */
  getCategoryLabel(category: CandyCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  /**
   * Formatea un monto como precio en pesos chilenos.
   * @param amount Monto numérico.
   * @returns Precio formateado (ej. `$2.990`).
   * @usageNotes Usado en carrito, catálogo e inventario.
   */
  formatPrice(amount: number): string {
    return `$${Number(amount).toLocaleString('es-CL')}`;
  }

  /**
   * Formatea un descuento decimal como porcentaje visible.
   * @param discount Descuento decimal (ej. `0.15`).
   * @returns Porcentaje redondeado (ej. `15%`).
   * @usageNotes Mostrado en tarjetas de caja y resumen del carrito.
   */
  formatDiscountPercent(discount: number): string {
    return `${Math.round(discount * 100)}%`;
  }

  private mapInventoryItemToCandy(item: InventoryItem): Candy {
    return {
      id: item.productId,
      name: item.name,
      category: item.category,
      size: item.size,
      price: item.price,
      image: item.image,
      description: item.description,
      discount: item.discount,
    };
  }
}
