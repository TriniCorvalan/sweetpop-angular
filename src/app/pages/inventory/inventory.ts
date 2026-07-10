import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InventoryItem } from '../../core/models/inventory-item.model';
import { CatalogService } from '../../core/services/catalog.service';
import { InventoryService } from '../../core/services/inventory.service';
import { consumeInventoryFlash } from '../../core/utils/inventory-flash';

/**
 * Página de inventario (admin): lista productos y enlaza al detalle editable.
 * @usageNotes Ruta `/inventario`; requiere rol `admin` vía `authGuard`.
 */
@Component({
  selector: 'app-inventory',
  imports: [RouterLink],
  templateUrl: './inventory.html',
})
export class Inventory implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly catalog = inject(CatalogService);

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  /** Inventario completo. @usageNotes Getter consumido por la tabla de la plantilla. */
  get inventory(): InventoryItem[] {
    return this.inventoryService.getInventory();
  }

  /**
   * Muestra alertas flash pendientes (p. ej. tras eliminar desde el detalle).
   * @returns void
   */
  ngOnInit(): void {
    const flash = consumeInventoryFlash();
    if (flash) {
      this.showAlert(flash.type, flash.message);
    }
  }

  /**
   * Etiqueta y clase CSS según stock disponible o agotado.
   * @param stock Unidades disponibles del producto.
   * @returns Objeto con `label` y `badgeClass` para la plantilla.
   * @usageNotes Muestra badge verde (Disponible) o rojo (Agotado).
   */
  getStockStatus(stock: number): { label: string; badgeClass: string } {
    if (stock > 0) {
      return { label: 'Disponible', badgeClass: 'badge-stock-available' };
    }
    return { label: 'Agotado', badgeClass: 'badge-stock-empty' };
  }

  /**
   * Elimina un producto del inventario tras confirmación.
   * @param item Producto a eliminar.
   * @returns void
   * @usageNotes Invocado desde el botón eliminar de cada fila.
   */
  deleteProduct(item: InventoryItem): void {
    this.clearAlerts();

    const confirmed = window.confirm(
      `¿Eliminar "${item.name}" del inventario? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    const productName = item.name;
    this.inventoryService.deleteItem(item.id).subscribe({
      next: (deleted) => {
        if (!deleted) {
          this.showAlert('danger', 'No fue posible eliminar el producto.');
          return;
        }
        this.showAlert('success', `Producto "${productName}" eliminado correctamente.`);
      },
      error: () => {
        this.showAlert('danger', 'No fue posible eliminar el producto.');
      },
    });
  }

  /**
   * Limpia el mensaje de alerta del listado.
   * @returns void
   */
  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  private showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.cdr.detectChanges();
  }
}
