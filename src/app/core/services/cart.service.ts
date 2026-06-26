import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { CartItem } from '../models/cart-item.model';
import { ServiceResult } from '../models/service-result.model';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { StorageService } from './storage.service';

/**
 * Servicio de gestión del carrito y pago simulado.
 * @usageNotes Persiste cajas personalizadas en `localStorage` (`STORAGE_KEYS.cart`).
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(
    private readonly storage: StorageService,
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
  ) {}

  /**
   * Asegura que exista un carrito vacío en localStorage.
   * @returns void
   * @usageNotes Ejecutado en el `APP_INITIALIZER` al arrancar la aplicación.
   */
  ensureCart(): void {
    const cart = this.storage.readJson<CartItem[] | null>(localStorage, STORAGE_KEYS.cart, null);
    if (cart === null || !Array.isArray(cart)) {
      this.saveCart([]);
    }
  }

  /**
   * Obtiene las cajas personalizadas del carrito.
   * @returns Lista de ítems del carrito.
   * @usageNotes Consumido por la página Cart y el Header (contador).
   */
  getCart(): CartItem[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.cart, []);
  }

  /**
   * Persiste el carrito completo.
   * @param cart Ítems del carrito a guardar.
   * @returns void
   * @usageNotes Sobrescribe el carrito completo en localStorage.
   */
  saveCart(cart: CartItem[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.cart, cart);
  }

  /**
   * Cuenta cuántas cajas hay en el carrito.
   * @returns Cantidad de ítems.
   * @usageNotes Usado por Header para mostrar `Carrito (n)`.
   */
  getCartCount(): number {
    return this.getCart().length;
  }

  /**
   * Calcula el total general del carrito.
   * @param cart Carrito a evaluar; usa el persistido si se omite.
   * @returns Suma de totales de cada caja.
   * @usageNotes Mostrado como total a pagar en la página Cart.
   */
  getCartGrandTotal(cart: CartItem[] = this.getCart()): number {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * Elimina una caja del carrito por su id.
   * @param cartItemId Id único del ítem en el carrito.
   * @returns void
   * @usageNotes Invocado desde el botón eliminar en Cart.
   */
  removeCartItem(cartItemId: string): void {
    const cart = this.getCart().filter((item) => item.cartItemId !== cartItemId);
    this.saveCart(cart);
  }

  /**
   * Valida que el inventario cubra todas las cajas del carrito.
   * @param cart Carrito a validar.
   * @returns Resultado con mensaje de error si falta stock.
   * @usageNotes Ejecutado antes de `processCartPayment`.
   */
  validateCartStock(cart: CartItem[]): ServiceResult {
    const stockNeeded = this.getStockNeededFromCart(cart);

    for (const [productId, quantity] of Object.entries(stockNeeded)) {
      if (this.inventory.getStock(productId) < quantity) {
        const candy = this.catalog.getCandyById(productId);
        return {
          success: false,
          message: `${candy ? candy.name : 'Un dulce'} no está disponible en la cantidad necesaria.`,
        };
      }
    }

    return { success: true, message: '' };
  }

  /**
   * Procesa el pago simulado y vacía el carrito si hay stock suficiente.
   * @returns Resultado de la operación con mensaje para el usuario.
   * @usageNotes Descuenta inventario y limpia el carrito al confirmar pago.
   */
  processCartPayment(): ServiceResult {
    const cart = this.getCart();

    if (cart.length === 0) {
      return { success: false, message: 'Tu carrito está vacío.' };
    }

    const validation = this.validateCartStock(cart);
    if (!validation.success) {
      return validation;
    }

    this.deductInventoryForCart(cart);
    this.saveCart([]);

    return {
      success: true,
      message: '¡Pago realizado con éxito! Gracias por tu compra en SweetPop.',
    };
  }

  private getStockNeededFromCart(cart: CartItem[]): Record<string, number> {
    const stockNeeded: Record<string, number> = {};

    cart.forEach((item) => {
      item.walls.forEach((wall) => {
        const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
        stockNeeded[wall.productId!] = (stockNeeded[wall.productId!] ?? 0) + quantity;
      });
    });

    return stockNeeded;
  }

  private deductInventoryForCart(cart: CartItem[]): void {
    const stockNeeded = this.getStockNeededFromCart(cart);

    Object.entries(stockNeeded).forEach(([productId, quantity]) => {
      const currentStock = this.inventory.getStock(productId);
      this.inventory.updateStock(productId, currentStock - quantity);
    });
  }
}
