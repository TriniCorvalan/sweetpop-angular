import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartItem } from '../../core/models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';

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

  get cart(): CartItem[] {
    return this.cartService.getCart();
  }

  get grandTotal(): number {
    return this.cartService.getCartGrandTotal(this.cart);
  }

  removeItem(cartItemId: string): void {
    this.cartService.removeCartItem(cartItemId);
    this.showAlert('info', 'Caja eliminada del carrito.');
  }

  pay(): void {
    this.clearAlert();
    const result = this.cartService.processCartPayment();

    if (!result.success) {
      this.showAlert(result.message.includes('vacío') ? 'warning' : 'danger', result.message);
      return;
    }

    this.showAlert('success', result.message);
  }

  getWallLineTotal(wall: CartItem['walls'][number]): number {
    const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
    return wall.price! * quantity;
  }

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
