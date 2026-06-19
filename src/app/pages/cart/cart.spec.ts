import { TestBed } from '@angular/core/testing';

import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import {
  clearStorages,
  createSampleCartItem,
  SAMPLE_BOX_CALCULATION,
} from '../../testing/test-helpers';
import { Cart } from './cart';

describe('Cart', () => {
  let cartService: CartService;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Cart],
    }).compileComponents();
    cartService = TestBed.inject(CartService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Cart);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('calculo del carrito', () => {
    it('calcula lineas, descuento y total general segun la formula', () => {
      const item = createSampleCartItem();
      cartService.saveCart([item]);
      const fixture = TestBed.createComponent(Cart);
      const component = fixture.componentInstance;

      expect(component.getWallLineTotal(item.walls[0])).toBe(2000);
      expect(component.getDiscountAmount(item)).toBe(SAMPLE_BOX_CALCULATION.discountAmount);
      expect(component.grandTotal).toBe(SAMPLE_BOX_CALCULATION.total);
    });

    it('muestra el total a pagar en la vista', () => {
      cartService.saveCart([createSampleCartItem()]);
      const catalog = TestBed.inject(CatalogService);
      const fixture = TestBed.createComponent(Cart);
      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain('Total a pagar');
      expect(element.textContent).toContain(catalog.formatPrice(SAMPLE_BOX_CALCULATION.total));
    });
  });
});
