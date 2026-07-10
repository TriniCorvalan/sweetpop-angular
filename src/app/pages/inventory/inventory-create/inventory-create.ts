import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CATEGORY_LABELS, INITIAL_STOCK } from '../../../core/constants/storage-keys';
import { CandyCategory, CandySize } from '../../../core/models/candy.model';
import { InventoryService } from '../../../core/services/inventory.service';

/**
 * Alta de un producto nuevo en el inventario.
 * @usageNotes Ruta `/inventario/nuevo`; requiere rol `admin` vía `authGuard`.
 */
@Component({
  selector: 'app-inventory-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inventory-create.html',
})
export class InventoryCreate {
  private readonly inventoryService = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

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
    stock: [INITIAL_STOCK, [Validators.required, Validators.min(0)]],
  });

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
   * Crea el producto y navega a su detalle.
   * @returns void
   * @usageNotes Invocado al enviar el formulario de alta.
   */
  onSubmit(): void {
    this.clearAlerts();

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.showAlert('danger', 'Revisa los campos del formulario e inténtalo de nuevo.');
      return;
    }

    const values = this.itemForm.getRawValue();
    const created = this.inventoryService.createItem({
      name: values.name,
      category: values.category,
      size: values.size,
      price: Number(values.price),
      image: values.image,
      description: values.description,
      discount: Number(values.discount),
      stock: Number(values.stock),
    });

    if (!created) {
      this.showAlert('danger', 'No fue posible crear el producto.');
      return;
    }

    void this.router.navigate(['/inventario', created.productId]);
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
