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

  ngOnInit(): void {
    this.buildInventoryForm();
  }

  get inventory(): InventoryItem[] {
    return this.inventoryService.getInventory();
  }

  get stockItems(): FormArray<FormGroup> {
    return this.inventoryForm.controls.items;
  }

  getStockStatus(stock: number): { label: string; badgeClass: string } {
    if (stock > 0) {
      return { label: 'Disponible', badgeClass: 'badge-stock-available' };
    }
    return { label: 'Agotado', badgeClass: 'badge-stock-empty' };
  }

  isStockInvalid(index: number): boolean {
    const control = this.stockItems.at(index).get('stock');
    return !!(control && control.invalid && control.touched);
  }

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
