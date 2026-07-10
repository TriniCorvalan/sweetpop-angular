import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { CANDY_CATALOG } from '../../../core/data/candy-catalog';
import { InventoryService } from '../../../core/services/inventory.service';
import { clearStorages } from '../../../testing/test-helpers';
import { InventoryDetail } from './inventory-detail';

describe('InventoryDetail', () => {
  const productId = CANDY_CATALOG[0].id;
  let component: InventoryDetail;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    clearStorages();

    await TestBed.configureTestingModule({
      imports: [InventoryDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ productId }),
            },
          },
        },
      ],
    }).compileComponents();

    inventoryService = TestBed.inject(InventoryService);
    inventoryService.ensureInventory();
    component = TestBed.createComponent(InventoryDetail).componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.item?.productId).toBe(productId);
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

  it('muestra error al intentar guardar datos invalidos', () => {
    component.itemForm.controls.stock.setValue(-1);

    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toContain('campos del formulario');
  });

  it('actualiza el producto con valores validos', () => {
    component.itemForm.patchValue({
      name: 'Dulce editado',
      stock: 42,
      price: 1990,
    });

    component.onSubmit();

    const updated = inventoryService.getInventoryItem(productId);
    expect(component.alertType).toBe('success');
    expect(updated?.name).toBe('Dulce editado');
    expect(updated?.stock).toBe(42);
    expect(updated?.price).toBe(1990);
  });

  it('redirige al listado si el producto no existe', async () => {
    clearStorages();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [InventoryDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ productId: 'no-existe' }),
            },
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(InventoryDetail);
    fixture.componentInstance.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/inventario']);
  });
});
