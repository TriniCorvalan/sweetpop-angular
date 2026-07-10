import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InventoryItem } from '../../core/models/inventory-item.model';
import { CatalogService } from '../../core/services/catalog.service';
import { InventoryService } from '../../core/services/inventory.service';

/**
 * Página de inventario (admin): lista productos y enlaza al detalle editable.
 * @usageNotes Ruta `/inventario`; requiere rol `admin` vía `authGuard`.
 */
@Component({
  selector: 'app-inventory',
  imports: [RouterLink],
  templateUrl: './inventory.html',
})
export class Inventory {
  private readonly inventoryService = inject(InventoryService);
  protected readonly catalog = inject(CatalogService);

  /** Inventario completo. @usageNotes Getter consumido por la tabla de la plantilla. */
  get inventory(): InventoryItem[] {
    return this.inventoryService.getInventory();
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
    const confirmed = window.confirm(
      `¿Eliminar "${item.name}" del inventario? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    this.inventoryService.deleteItem(item.id).subscribe();
  }
}
