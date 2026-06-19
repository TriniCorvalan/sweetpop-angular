import { TestBed } from '@angular/core/testing';

import { BoxDraftService } from './box-draft.service';
import { CartService } from './cart.service';
import { InventoryService } from './inventory.service';
import {
  clearStorages,
  createSampleCompleteBoxDraft,
  SAMPLE_BOX_CALCULATION,
  seedSession,
} from '../../testing/test-helpers';

describe('BoxDraftService', () => {
  let service: BoxDraftService;
  let cartService: CartService;
  let inventoryService: InventoryService;

  beforeEach(() => {
    clearStorages();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxDraftService);
    cartService = TestBed.inject(CartService);
    inventoryService = TestBed.inject(InventoryService);
    inventoryService.ensureInventory();
  });

  describe('flujo de personalizacion', () => {
    it('rechaza startBoxDraft si no hay sesion de cliente', () => {
      const result = service.startBoxDraft('box-simple');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Debes iniciar sesión como cliente');
      expect(result.redirect).toBe('/inicio-sesion');
    });

    it('crea un borrador con una pared por nivel de la caja simple', () => {
      seedSession('user');

      const result = service.startBoxDraft('box-simple');

      expect(result.success).toBe(true);
      const draft = service.getBoxDraft();
      expect(draft?.wallsCount).toBe(4);
      expect(draft?.walls).toHaveLength(4);
      expect(draft?.walls.every((wall) => wall.productId === null)).toBe(true);
    });

    it('asigna dulces compatibles hasta completar el borrador', () => {
      seedSession('user');
      service.startBoxDraft('box-simple');

      const candyIds = ['gom-gummy-bears', 'gom-jelly-beans', 'gom-worms', 'cho-kisses'];

      candyIds.forEach((productId) => {
        const result = service.assignCandyToWall(productId);
        expect(result.success).toBe(true);
      });

      expect(service.isBoxDraftComplete()).toBe(true);
    });

    it('addCompletedBoxToCart agrega la caja al carrito y limpia el borrador', () => {
      seedSession('user');
      service.startBoxDraft('box-simple');

      ['gom-gummy-bears', 'gom-jelly-beans', 'gom-worms', 'cho-kisses'].forEach((productId) => {
        service.assignCandyToWall(productId);
      });

      const result = service.addCompletedBoxToCart();

      expect(result.success).toBe(true);
      expect(cartService.getCart()).toHaveLength(1);
      expect(service.getBoxDraft()).toBeNull();
    });
  });

  describe('calculo del carrito', () => {
    beforeEach(() => {
      seedSession('user');
    });

    it('calcula candiesSubtotal y total al agregar una caja completa', () => {
      service.saveBoxDraft(createSampleCompleteBoxDraft());

      const result = service.addCompletedBoxToCart();

      expect(result.success).toBe(true);

      const cartItem = cartService.getCart()[0];
      expect(cartItem.candiesSubtotal).toBe(SAMPLE_BOX_CALCULATION.candiesSubtotal);
      expect(cartItem.total).toBe(SAMPLE_BOX_CALCULATION.total);
    });
  });
});
