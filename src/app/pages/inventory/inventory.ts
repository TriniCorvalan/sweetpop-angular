import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InventoryItem } from '../../core/models/inventory-item.model';
import { CatalogService } from '../../core/services/catalog.service';
import { InventoryService } from '../../core/services/inventory.service';

/**
 * Página de inventario (admin): consulta stock y permite actualizarlo.
 * @usageNotes Ruta `/inventario`; requiere rol `admin` vía `authGuard`.
 */
@Component({
  selector: 'app-inventory',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inventory.html',
})
export class Inventory implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly fb = inject(FormBuilder);
  protected readonly catalog = inject(CatalogService);

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  inventoryForm = this.fb.group({
    items: this.fb.array<FormGroup>([]),
  });

  /**
   * Construye el formulario reactivo con el stock actual.
   * @returns void
   * @usageNotes Ejecutado al cargar la página.
   */
  ngOnInit(): void {
    this.buildInventoryForm();
  }

  /** Inventario completo desde localStorage. @usageNotes Getter consumido por la plantilla. */
  get inventory(): InventoryItem[] {
    return this.inventoryService.getInventory();
  }

  /** Controles de stock del formulario. @usageNotes Un `FormGroup` por producto. */
  get stockItems(): FormArray<FormGroup> {
    return this.inventoryForm.controls.items;
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
   * Indica si el stock de una fila es inválido.
   * @param index Índice de la fila en `stockItems`.
   * @returns `true` si el control stock está inválido y fue tocado.
   * @usageNotes Usado en la plantilla para resaltar errores de validación.
   */
  isStockInvalid(index: number): boolean {
    const control = this.stockItems.at(index).get('stock');
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Persiste el stock editado de un producto.
   * @param index Índice de la fila en `stockItems`.
   * @returns void
   * @usageNotes Invocado desde el botón actualizar de cada fila.
   */
  updateStock(index: number): void {
    const itemGroup = this.stockItems.at(index);
    const stockControl = itemGroup.get('stock');

    if (!stockControl || stockControl.invalid) {
      stockControl?.markAsTouched();
      this.showAlert('danger', 'Ingresa un stock válido (número mayor o igual a 0).');
      return;
    }

    const productId = itemGroup.get('productId')?.value as string;
    const parsedStock = Number(stockControl.value);

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      stockControl.markAsTouched();
      this.showAlert('danger', 'Ingresa un stock válido (número mayor o igual a 0).');
      return;
    }

    const updated = this.inventoryService.updateStock(productId, parsedStock);

    if (!updated) {
      this.showAlert('danger', 'No fue posible actualizar el stock.');
      return;
    }

    stockControl.setValue(parsedStock);
    this.showAlert('success', 'Stock actualizado correctamente.');
  }

  private buildInventoryForm(): void {
    const groups = this.inventory.map((item) =>
      this.fb.group({
        productId: [item.productId],
        stock: [item.stock, [Validators.required, Validators.min(0)]],
      }),
    );

    this.inventoryForm.setControl('items', this.fb.array(groups));
  }

  private showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
