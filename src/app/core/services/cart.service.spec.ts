import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { InventoryService } from './inventory.service';
import {
  clearStorages,
  createSampleCartItem,
  flushInventoryUpdateRequest,
  SAMPLE_BOX_CALCULATION,
  seedInventoryCache,
} from '../../testing/test-helpers';

describe('CartService', () => {
  let service: CartService;
  let inventoryService: InventoryService;

  beforeEach(() => {
    clearStorages();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    inventoryService = TestBed.inject(InventoryService);
    seedInventoryCache();
  });

  describe('calculo del carrito', () => {
    it('getCartGrandTotal suma el total de multiples cajas', () => {
      const firstItem = createSampleCartItem({
        cartItemId: 'cart-test-1',
        total: SAMPLE_BOX_CALCULATION.total,
      });
      const secondItem = createSampleCartItem({
        cartItemId: 'cart-test-2',
        total: 20000,
      });

      service.saveCart([firstItem, secondItem]);

      expect(service.getCartGrandTotal()).toBe(SAMPLE_BOX_CALCULATION.total + 20000);
    });
  });

  describe('pago', () => {
    it('processCartPayment rechaza un carrito vacio', () => {
      const result = service.processCartPayment();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Tu carrito está vacío.');
    });

    it('processCartPayment descuenta inventario y vacia el carrito con stock suficiente', () => {
      const cartItem = createSampleCartItem();
      service.saveCart([cartItem]);

      const stockBefore = inventoryService.getStock(1);
      const result = service.processCartPayment();

      flushInventoryUpdateRequest(1);
      flushInventoryUpdateRequest(2);
      flushInventoryUpdateRequest(3);
      flushInventoryUpdateRequest(4);

      expect(result.success).toBe(true);
      expect(service.getCart()).toHaveLength(0);
      expect(inventoryService.getStock(1)).toBe(stockBefore - 4);
    });
  });
});
