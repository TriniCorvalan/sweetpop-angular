import { TestBed } from '@angular/core/testing';

import { InventoryService } from '../../core/services/inventory.service';
import { clearStorages } from '../../testing/test-helpers';
import { Inventory } from './inventory';

describe('Inventory', () => {
  let component: Inventory;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Inventory],
    }).compileComponents();

    TestBed.inject(InventoryService).ensureInventory();
    component = TestBed.createComponent(Inventory).componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('muestra error al intentar guardar un stock invalido', () => {
    component.stockItems.at(0).get('stock')?.setValue(-1);

    component.updateStock(0);

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toContain('stock válido');
  });

  it('actualiza el stock correctamente con un valor valido', () => {
    const inventoryService = TestBed.inject(InventoryService);
    const productId = component.inventory[0].productId;
    component.stockItems.at(0).get('stock')?.setValue(15);

    component.updateStock(0);

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toBe('Stock actualizado correctamente.');
    expect(inventoryService.getStock(productId)).toBe(15);
  });
});
