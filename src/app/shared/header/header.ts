import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

/** @ignore */
interface NavItem {
  label: string;
  route?: string;
  exact?: boolean;
  dulcesGroup?: boolean;
}

/**
 * Cabecera con navegación dinámica según sesión, rol y cantidad en carrito.
 * @usageNotes Renderizada en el layout raíz (`App`); se actualiza en cada `NavigationEnd`.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly auth = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  navItems: NavItem[] = [];

  constructor() {
    this.refreshNav();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.refreshNav());
  }

  /**
   * Recalcula los enlaces de navegación según sesión y rol.
   * @returns void
   * @usageNotes Invocado al iniciar y tras cada cambio de ruta.
   */
  refreshNav(): void {
    const session = this.auth.getSession();
    const commonLinks: NavItem[] = [
      { label: 'Inicio', route: '/', exact: true },
      { label: 'Cajas', route: '/cajas' },
      { label: 'Dulces', route: '/dulces', dulcesGroup: true },
    ];

    if (!session) {
      this.navItems = [
        ...commonLinks,
        { label: 'Iniciar sesión', route: '/inicio-sesion' },
        { label: 'Registro', route: '/registro' },
      ];
      return;
    }

    if (session.role === 'admin') {
      this.navItems = [
        ...commonLinks,
        { label: 'Inventario', route: '/inventario' },
        { label: 'Clientes', route: '/clientes' },
        { label: 'Cerrar sesión', route: '/cerrar-sesion' },
      ];
      return;
    }

    const cartCount = this.cartService.getCartCount();
    const cartLabel = cartCount > 0 ? `Carrito (${cartCount})` : 'Carrito';

    this.navItems = [
      ...commonLinks,
      { label: cartLabel, route: '/carrito' },
      { label: 'Mi perfil', route: '/perfil' },
      { label: 'Cerrar sesión', route: '/cerrar-sesion' },
    ];
  }

  /**
   * Indica si alguna ruta de dulces está activa.
   * @returns `true` si la URL pertenece al grupo de categorías de dulces.
   * @usageNotes Resalta el enlace "Dulces" en la barra de navegación.
   */
  isDulcesActive(): boolean {
    const url = this.router.url;
    return (
      url.startsWith('/dulces') ||
      url.startsWith('/gomitas') ||
      url.startsWith('/chocolates') ||
      url.startsWith('/caramelos') ||
      url.startsWith('/barritas')
    );
  }
}
