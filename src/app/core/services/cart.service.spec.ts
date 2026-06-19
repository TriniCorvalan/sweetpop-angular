import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { InventoryService } from './inventory.service';
import {
  clearStorages,
  createSampleCartItem,
  SAMPLE_BOX_CALCULATION,
} from '../../testing/test-helpers';

describe('CartService', () => {
  let service: CartService;
  let inventoryService: InventoryService;

  beforeEach(() => {
    clearStorages();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    inventoryService = TestBed.inject(InventoryService);
    inventoryService.ensureInventory();
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

      const stockBefore = inventoryService.getStock('gom-gummy-bears');
      const result = service.processCartPayment();

      expect(result.success).toBe(true);
      expect(service.getCart()).toHaveLength(0);
      expect(inventoryService.getStock('gom-gummy-bears')).toBe(stockBefore - 4);
    });
  });
});
