import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { InventoryService } from '../../core/services/inventory.service';
import { clearStorages, flushInventoryDeleteRequest, seedInventoryCache } from '../../testing/test-helpers';
import { Inventory } from './inventory';

describe('Inventory', () => {
  let component: Inventory;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Inventory],
      providers: [provideRouter([])],
    }).compileComponents();

    seedInventoryCache();
    component = TestBed.createComponent(Inventory).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lista productos del inventario', () => {
    expect(component.inventory.length).toBeGreaterThan(0);
  });

  it('indica disponibilidad segun el stock', () => {
    expect(component.getStockStatus(5)).toEqual({
      label: 'Disponible',
      badgeClass: 'badge-stock-available',
    });
    expect(component.getStockStatus(0)).toEqual({
      label: 'Agotado',
      badgeClass: 'badge-stock-empty',
    });
  });

  it('elimina un producto tras confirmar', () => {
    const inventoryService = TestBed.inject(InventoryService);
    const product = component.inventory[0];
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteProduct(product);
    flushInventoryDeleteRequest(product.id);

    expect(inventoryService.getInventoryItem(product.id)).toBeUndefined();
    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toContain('eliminado correctamente');
  });

  it('muestra mensaje flash al llegar tras eliminar desde el detalle', () => {
    sessionStorage.setItem(
      'sweetpop.inventory.flash',
      JSON.stringify({
        type: 'success',
        message: 'Producto "Dulce" eliminado correctamente.',
      }),
    );

    const fixture = TestBed.createComponent(Inventory);
    fixture.componentInstance.ngOnInit();

    expect(fixture.componentInstance.alertType).toBe('success');
    expect(fixture.componentInstance.alertMessage).toContain('eliminado correctamente');
  });
});
