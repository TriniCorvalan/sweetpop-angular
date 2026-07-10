import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { BoxDraftService } from './box-draft.service';
import { CartService } from './cart.service';
import {
  clearStorages,
  createSampleCompleteBoxDraft,
  flushBoxesRequest,
  SAMPLE_BOX_CALCULATION,
  seedInventoryCache,
  seedSession,
} from '../../testing/test-helpers';

describe('BoxDraftService', () => {
  let service: BoxDraftService;
  let cartService: CartService;

  beforeEach(() => {
    clearStorages();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxDraftService);
    cartService = TestBed.inject(CartService);
    seedInventoryCache();
  });

  describe('flujo de personalizacion', () => {
    it('rechaza startBoxDraft si no hay sesion de cliente', async () => {
      const result = await firstValueFrom(service.startBoxDraft('box-simple'));

      expect(result.success).toBe(false);
      expect(result.message).toContain('Debes iniciar sesión como cliente');
      expect(result.redirect).toBe('/inicio-sesion');
    });

    it('crea un borrador con una pared por nivel de la caja simple', async () => {
      seedSession('user');

      const resultPromise = firstValueFrom(service.startBoxDraft('box-simple'));
      flushBoxesRequest();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      const draft = service.getBoxDraft();
      expect(draft?.wallsCount).toBe(4);
      expect(draft?.walls).toHaveLength(4);
      expect(draft?.walls.every((wall) => wall.productId === null)).toBe(true);
    });

    it('asigna dulces compatibles hasta completar el borrador', async () => {
      seedSession('user');
      const startPromise = firstValueFrom(service.startBoxDraft('box-simple'));
      flushBoxesRequest();
      await startPromise;

      const candyIds = [1, 2, 3, 4];

      candyIds.forEach((productId) => {
        const result = service.assignCandyToWall(productId);
        expect(result.success).toBe(true);
      });

      expect(service.isBoxDraftComplete()).toBe(true);
    });

    it('addCompletedBoxToCart agrega la caja al carrito y limpia el borrador', async () => {
      seedSession('user');
      const startPromise = firstValueFrom(service.startBoxDraft('box-simple'));
      flushBoxesRequest();
      await startPromise;

      [1, 2, 3, 4].forEach((productId) => {
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
