import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartItem } from '../../core/models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';

/**
 * Página del carrito: lista cajas personalizadas y procesa pago simulado.
 * @usageNotes Ruta `/carrito`; requiere rol `user` vía `authGuard`.
 */
@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
})
export class Cart {
  private readonly cartService = inject(CartService);
  protected readonly catalog = inject(CatalogService);

  alertType: 'success' | 'danger' | 'warning' | 'info' | null = null;
  alertMessage = '';

  /** Ítems del carrito persistidos. @usageNotes Getter consumido por la plantilla. */
  get cart(): CartItem[] {
    return this.cartService.getCart();
  }

  /** Total general del carrito. @usageNotes Suma de totales de cada caja personalizada. */
  get grandTotal(): number {
    return this.cartService.getCartGrandTotal(this.cart);
  }

  /**
   * Elimina una caja del carrito.
   * @param cartItemId Id único del ítem en el carrito.
   * @returns void
   * @usageNotes Invocado desde el botón eliminar de cada fila.
   */
  removeItem(cartItemId: string): void {
    this.cartService.removeCartItem(cartItemId);
    this.showAlert('info', 'Caja eliminada del carrito.');
  }

  /**
   * Procesa el pago simulado del carrito.
   * @returns void
   * @usageNotes Valida stock, descuenta inventario y vacía el carrito al confirmar.
   */
  pay(): void {
    this.clearAlert();
    const result = this.cartService.processCartPayment();

    if (!result.success) {
      this.showAlert(result.message.includes('vacío') ? 'warning' : 'danger', result.message);
      return;
    }

    this.showAlert('success', result.message);
  }

  /**
   * Calcula el subtotal de una pared del carrito.
   * @param wall Pared con precio, tamaño y cantidad.
   * @returns Monto de la línea (precio × cantidad).
   * @usageNotes Mostrado en el detalle de paredes de cada caja.
   */
  getWallLineTotal(wall: CartItem['walls'][number]): number {
    const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
    return wall.price! * quantity;
  }

  /**
   * Calcula el monto descontado de una caja del carrito.
   * @param item Ítem del carrito.
   * @returns Monto del descuento aplicado a la caja.
   * @usageNotes Mostrado como línea de descuento en el resumen.
   */
  getDiscountAmount(item: CartItem): number {
    return Math.round((item.boxPrice + item.candiesSubtotal) * item.discount);
  }

  private showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

  private clearAlert(): void {
    this.alertType = null;
    this.alertMessage = '';
  }
}
