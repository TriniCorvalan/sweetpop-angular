import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InventoryService } from '../../core/services/inventory.service';
import { clearStorages } from '../../testing/test-helpers';
import { Inventory } from './inventory';

describe('Inventory', () => {
  let component: Inventory;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Inventory],
      providers: [provideRouter([])],
    }).compileComponents();

    TestBed.inject(InventoryService).ensureInventory();
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
});
