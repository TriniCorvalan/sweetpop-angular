import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InventoryItem } from '../../core/models/inventory-item.model';
import { CatalogService } from '../../core/services/catalog.service';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-inventory',
  imports: [FormsModule, RouterLink],
  templateUrl: './inventory.html',
})
export class Inventory {
  private readonly inventoryService = inject(InventoryService);
  protected readonly catalog = inject(CatalogService);

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  get inventory(): InventoryItem[] {
    return this.inventoryService.getInventory();
  }

  getStockStatus(stock: number): { label: string; badgeClass: string } {
    if (stock > 0) {
      return { label: 'Disponible', badgeClass: 'badge-stock-available' };
    }
    return { label: 'Agotado', badgeClass: 'badge-stock-empty' };
  }

  updateStock(productId: string, stockValue: string): void {
    const parsedStock = Number(stockValue);

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      this.showAlert('danger', 'Ingresa un stock válido (número mayor o igual a 0).');
      return;
    }

    const updated = this.inventoryService.updateStock(productId, parsedStock);

    if (!updated) {
      this.showAlert('danger', 'No fue posible actualizar el stock.');
      return;
    }

    this.showAlert('success', 'Stock actualizado correctamente.');
  }

  private showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
