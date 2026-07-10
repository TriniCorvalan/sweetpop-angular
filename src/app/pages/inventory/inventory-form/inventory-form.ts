import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CATEGORY_LABELS, INITIAL_STOCK } from '../../../core/constants/storage-keys';
import { CandyCategory, CandySize } from '../../../core/models/candy.model';
import { InventoryItem, InventoryItemUpdate } from '../../../core/models/inventory-item.model';
import { CatalogService } from '../../../core/services/catalog.service';
import { InventoryService } from '../../../core/services/inventory.service';

/**
 * Formulario compartido de inventario: alta (`/inventario/nuevo`) o edición (`/inventario/:id`).
 * @usageNotes Requiere rol `admin` vía `authGuard`. Título y botones cambian según el modo.
 */
@Component({
  selector: 'app-inventory-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inventory-form.html',
})
export class InventoryForm implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  isEditMode = false;
  item: InventoryItem | null = null;
  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';
  ready = false;

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

  /** Título principal según modo. */
  get pageTitle(): string {
    if (this.isEditMode) {
      return this.item?.name ?? 'Editar producto';
    }
    return 'Nuevo producto';
  }

  /** Texto del breadcrumb activo. */
  get breadcrumbLabel(): string {
    return this.isEditMode ? (this.item?.name ?? 'Detalle') : 'Nuevo producto';
  }

  /** Descripción bajo el título. */
  get pageDescription(): string {
    return this.isEditMode
      ? 'Edita la cantidad en stock y los datos del producto.'
      : 'Completa los datos para agregarlo al inventario. El ID numérico lo asigna el servidor.';
  }

  /** Etiqueta del botón principal de envío. */
  get submitLabel(): string {
    return this.isEditMode ? 'Guardar cambios' : 'Crear producto';
  }

  /**
   * Detecta modo create/edit y carga el ítem si corresponde.
   * @returns void
   */
  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');

    if (!rawId) {
      this.isEditMode = false;
      this.ready = true;
      return;
    }

    const id = Number(rawId);
    if (Number.isNaN(id)) {
      void this.router.navigate(['/inventario']);
      return;
    }

    const item = this.inventoryService.getInventoryItem(id);
    if (!item) {
      void this.router.navigate(['/inventario']);
      return;
    }

    this.isEditMode = true;
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
    this.ready = true;
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
   * Precio formateado del ítem en edición.
   * @returns Precio en pesos chilenos o cadena vacía.
   */
  formatItemPrice(): string {
    return this.item ? this.catalog.formatPrice(this.item.price) : '';
  }

  /**
   * Crea o actualiza el producto según el modo.
   * @returns void
   */
  onSubmit(): void {
    this.clearAlerts();

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.showAlert('danger', 'Revisa los campos del formulario e inténtalo de nuevo.');
      return;
    }

    const values = this.itemForm.getRawValue();
    const payload: InventoryItemUpdate = {
      name: values.name,
      category: values.category,
      size: values.size,
      price: Number(values.price),
      image: values.image,
      description: values.description,
      discount: Number(values.discount),
      stock: Number(values.stock),
    };

    if (this.isEditMode) {
      this.saveEdit(payload);
      return;
    }

    this.saveCreate(payload);
  }

  /**
   * Elimina el producto en modo edición tras confirmación.
   * @returns void
   */
  onDelete(): void {
    if (!this.isEditMode || !this.item) {
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

  private saveCreate(payload: InventoryItemUpdate): void {
    this.inventoryService.createItem(payload).subscribe({
      next: (created) => {
        if (!created) {
          this.showAlert('danger', 'No fue posible crear el producto.');
          return;
        }
        void this.router.navigate(['/inventario', created.id]);
      },
      error: () => {
        this.showAlert('danger', 'No fue posible crear el producto.');
      },
    });
  }

  private saveEdit(payload: InventoryItemUpdate): void {
    if (!this.item) {
      this.showAlert('danger', 'No se encontró el producto en inventario.');
      return;
    }

    const id = this.item.id;
    this.inventoryService.updateItem(id, payload).subscribe({
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

  private showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
