import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { CartItem } from '../models/cart-item.model';
import { ServiceResult } from '../models/service-result.model';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(
    private readonly storage: StorageService,
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
  ) {}

  ensureCart(): void {
    const cart = this.storage.readJson<CartItem[] | null>(localStorage, STORAGE_KEYS.cart, null);
    if (cart === null || !Array.isArray(cart)) {
      this.saveCart([]);
    }
  }

  getCart(): CartItem[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.cart, []);
  }

  saveCart(cart: CartItem[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.cart, cart);
  }

  getCartCount(): number {
    return this.getCart().length;
  }

  getCartGrandTotal(cart: CartItem[] = this.getCart()): number {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }

  removeCartItem(cartItemId: string): void {
    const cart = this.getCart().filter((item) => item.cartItemId !== cartItemId);
    this.saveCart(cart);
  }

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
