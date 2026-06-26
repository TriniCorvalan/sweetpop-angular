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

/**
 * Servicio de consulta al catálogo estático y reglas de negocio.
 * @usageNotes Solo lectura; no persiste datos. Fuente de verdad para cajas, dulces y categorías.
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  /** Catálogo de cajas disponibles. @usageNotes Ver `BOX_CATALOG`. */
  readonly boxes = BOX_CATALOG;
  /** Catálogo de dulces disponibles. @usageNotes Ver `CANDY_CATALOG`. */
  readonly candies = CANDY_CATALOG;
  /** Catálogo de categorías para navegación. @usageNotes Ver `CATEGORY_CATALOG`. */
  readonly categories = CATEGORY_CATALOG;

  /**
   * Busca una caja por id.
   * @param boxId Id de la caja.
   * @returns Caja encontrada o `null`.
   * @usageNotes Usado al iniciar personalización (`BoxDraftService.startBoxDraft`).
   */
  getBoxById(boxId: string): Box | null {
    return this.boxes.find((box) => box.id === boxId) ?? null;
  }

  /**
   * Busca un dulce por id.
   * @param productId Id del producto.
   * @returns Dulce encontrado o `null`.
   * @usageNotes Usado al asignar dulces a paredes del borrador.
   */
  getCandyById(productId: string): Candy | null {
    return this.candies.find((candy) => candy.id === productId) ?? null;
  }

  /**
   * Filtra dulces por categoría.
   * @param category Id de categoría (`gomitas`, `chocolate`, etc.).
   * @returns Dulces de la categoría indicada.
   * @usageNotes Consumido por `CategoryProducts` en páginas de categoría.
   */
  getCandiesByCategory(category: CandyCategory): Candy[] {
    return this.candies.filter((candy) => candy.category === category);
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
}
