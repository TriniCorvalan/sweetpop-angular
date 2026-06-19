import { TestBed } from '@angular/core/testing';

import { CartService } from '../../core/services/cart.service';
import { clearStorages, createSampleCartItem, seedSession } from '../../testing/test-helpers';
import { Header } from './header';

describe('Header', () => {
  let component: Header;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    component = TestBed.createComponent(Header).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('refreshNav', () => {
    it('muestra enlaces de invitado sin sesion activa', () => {
      component.refreshNav();

      const labels = component.navItems.map((item) => item.label);
      expect(labels).toContain('Iniciar sesión');
      expect(labels).toContain('Registro');
      expect(labels).not.toContain('Mi perfil');
    });

    it('muestra enlaces de cliente cuando hay sesion de usuario', () => {
      seedSession('user');

      component.refreshNav();

      const labels = component.navItems.map((item) => item.label);
      expect(labels).toContain('Carrito');
      expect(labels).toContain('Mi perfil');
      expect(labels).not.toContain('Inventario');
    });

    it('muestra la cantidad de cajas en el enlace del carrito', () => {
      seedSession('user');
      TestBed.inject(CartService).saveCart([
        createSampleCartItem({ cartItemId: 'cart-1' }),
        createSampleCartItem({ cartItemId: 'cart-2' }),
      ]);

      component.refreshNav();

      expect(component.navItems.some((item) => item.label === 'Carrito (2)')).toBe(true);
    });

    it('muestra enlaces de admin cuando hay sesion administrativa', () => {
      seedSession('admin', { id: 'admin-test', username: 'admin' });

      component.refreshNav();

      const labels = component.navItems.map((item) => item.label);
      expect(labels).toContain('Inventario');
      expect(labels).toContain('Clientes');
      expect(labels).not.toContain('Carrito');
    });
  });
});
