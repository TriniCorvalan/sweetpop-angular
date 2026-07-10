import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CATEGORY_LABELS } from '../../../core/constants/storage-keys';
import { CandyCategory, CandySize } from '../../../core/models/candy.model';
import { InventoryItem } from '../../../core/models/inventory-item.model';
import { CatalogService } from '../../../core/services/catalog.service';
import { InventoryService } from '../../../core/services/inventory.service';

/**
 * Detalle de un producto del inventario: consulta y edita stock y datos.
 * @usageNotes Ruta `/inventario/:id`; requiere rol `admin` vía `authGuard`.
 */
@Component({
  selector: 'app-inventory-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inventory-detail.html',
})
export class InventoryDetail implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  item: InventoryItem | null = null;
  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  readonly categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as CandyCategory,
    label,
  }));

  readonly sizes: { value: CandySize; label: string }[] = [
    { value: 'small', label: 'pequeño' },
    { value: 'medium', label: 'medio' },
    { value: 'large', label: 'grande' },
  ];

  itemForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: this.fb.nonNullable.control<CandyCategory>('gomitas', Validators.required),
    size: this.fb.nonNullable.control<CandySize>('small', Validators.required),
    price: [0, [Validators.required, Validators.min(0)]],
    image: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    discount: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  /**
   * Carga el producto según el `id` de la ruta.
   * @returns void
   * @usageNotes Redirige al listado si el id no existe en inventario.
   */
  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!rawId || Number.isNaN(id)) {
      this.router.navigate(['/inventario']);
      return;
    }

    const item = this.inventoryService.getInventoryItem(id);
    if (!item) {
      this.router.navigate(['/inventario']);
      return;
    }

    this.item = item;
    this.itemForm.patchValue({
      name: item.name,
      category: item.category,
      size: item.size,
      price: item.price,
      image: item.image,
      description: item.description,
      discount: item.discount,
      stock: item.stock,
    });
  }

  /**
   * Etiqueta y clase CSS según stock disponible o agotado.
   * @param stock Unidades disponibles del producto.
   * @returns Objeto con `label` y `badgeClass` para la plantilla.
   */
  getStockStatus(stock: number): { label: string; badgeClass: string } {
    if (stock > 0) {
      return { label: 'Disponible', badgeClass: 'badge-stock-available' };
    }
    return { label: 'Agotado', badgeClass: 'badge-stock-empty' };
  }

  /**
   * Indica si un control del formulario es inválido y fue tocado.
   * @param controlName Nombre del control.
   * @returns `true` si debe mostrarse feedback de error.
   */
  isInvalid(controlName: string): boolean {
    const control = this.itemForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Precio formateado del ítem cargado.
   * @returns Precio en pesos chilenos o cadena vacía.
   */
  formatItemPrice(): string {
    return this.item ? this.catalog.formatPrice(this.item.price) : '';
  }

  /**
   * Persiste los cambios del producto en inventario.
   * @returns void
   * @usageNotes Invocado al enviar el formulario de detalle.
   */
  onSubmit(): void {
    this.clearAlerts();

    if (!this.item) {
      this.showAlert('danger', 'No se encontró el producto en inventario.');
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.showAlert('danger', 'Revisa los campos del formulario e inténtalo de nuevo.');
      return;
    }

    const id = this.item.id;
    const values = this.itemForm.getRawValue();
    this.inventoryService
      .updateItem(id, {
        name: values.name,
        category: values.category,
        size: values.size,
        price: Number(values.price),
        image: values.image,
        description: values.description,
        discount: Number(values.discount),
        stock: Number(values.stock),
      })
      .subscribe({
        next: (updated) => {
          if (!updated) {
            this.showAlert('danger', 'No fue posible guardar los cambios.');
            return;
          }
          this.item = this.inventoryService.getInventoryItem(id) ?? this.item;
          this.showAlert('success', 'Producto actualizado correctamente.');
        },
        error: () => {
          this.showAlert('danger', 'No fue posible guardar los cambios.');
        },
      });
  }

  /**
   * Elimina el producto del inventario tras confirmación.
   * @returns void
   * @usageNotes Invocado desde el botón eliminar del detalle.
   */
  onDelete(): void {
    if (!this.item) {
      this.showAlert('danger', 'No se encontró el producto en inventario.');
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar "${this.item.name}" del inventario? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    this.inventoryService.deleteItem(this.item.id).subscribe({
      next: (deleted) => {
        if (!deleted) {
          this.showAlert('danger', 'No fue posible eliminar el producto.');
          return;
        }
        void this.router.navigate(['/inventario']);
      },
      error: () => {
        this.showAlert('danger', 'No fue posible eliminar el producto.');
      },
    });
  }

  /**
   * Limpia alertas al editar campos.
   * @returns void
   */
  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  private showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
