import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { InventoryService } from '../../core/services/inventory.service';
import { INVENTORY_CONNECTION_ERROR_MESSAGE } from '../../core/utils/api-connection';
import {
  clearStorages,
  failInventoryLoadRequest,
  flushInventoryDeleteRequest,
  flushInventoryLoadRequest,
  seedInventoryCache,
} from '../../testing/test-helpers';
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
    const fixture = TestBed.createComponent(Inventory);
    component = fixture.componentInstance;
    component.ngOnInit();
    flushInventoryLoadRequest();
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
    clearStorages();
    sessionStorage.setItem(
      'sweetpop.inventory.flash',
      JSON.stringify({
        type: 'success',
        message: 'Producto "Dulce" eliminado correctamente.',
      }),
    );
    seedInventoryCache();

    const fixture = TestBed.createComponent(Inventory);
    fixture.componentInstance.ngOnInit();
    flushInventoryLoadRequest();

    expect(fixture.componentInstance.alertType).toBe('success');
    expect(fixture.componentInstance.alertMessage).toContain('eliminado correctamente');
  });

  it('muestra error de conexion si json-server no responde', () => {
    clearStorages();
    seedInventoryCache();

    const fixture = TestBed.createComponent(Inventory);
    fixture.componentInstance.ngOnInit();
    failInventoryLoadRequest();

    expect(fixture.componentInstance.alertType).toBe('danger');
    expect(fixture.componentInstance.alertMessage).toBe(INVENTORY_CONNECTION_ERROR_MESSAGE);
  });
});
