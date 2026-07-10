import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { InventoryService } from '../../../core/services/inventory.service';
import {
  clearStorages,
  flushInventoryDeleteRequest,
  flushInventoryUpdateRequest,
  seedInventoryCache,
} from '../../../testing/test-helpers';
import { InventoryDetail } from './inventory-detail';

describe('InventoryDetail', () => {
  const itemId = 1;
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
              paramMap: convertToParamMap({ id: String(itemId) }),
            },
          },
        },
      ],
    }).compileComponents();

    inventoryService = TestBed.inject(InventoryService);
    seedInventoryCache();
    component = TestBed.createComponent(InventoryDetail).componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.item?.id).toBe(itemId);
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
      description: 'Descripción actualizada del dulce.',
      discount: 15,
    });

    component.onSubmit();
    flushInventoryUpdateRequest(itemId);

    const updated = inventoryService.getInventoryItem(itemId);
    expect(component.alertType).toBe('success');
    expect(updated?.name).toBe('Dulce editado');
    expect(updated?.stock).toBe(42);
    expect(updated?.price).toBe(1990);
    expect(updated?.description).toBe('Descripción actualizada del dulce.');
    expect(updated?.discount).toBe(15);
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
              paramMap: convertToParamMap({ id: '999' }),
            },
          },
        },
      ],
    }).compileComponents();

    seedInventoryCache();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(InventoryDetail);
    fixture.componentInstance.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/inventario']);
  });

  it('elimina el producto y vuelve al listado', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.onDelete();
    flushInventoryDeleteRequest(itemId);

    expect(inventoryService.getInventoryItem(itemId)).toBeUndefined();
    expect(navigateSpy).toHaveBeenCalledWith(['/inventario']);
  });

  it('no elimina si se cancela la confirmacion', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDelete();

    expect(inventoryService.getInventoryItem(itemId)).toBeTruthy();
  });
});
