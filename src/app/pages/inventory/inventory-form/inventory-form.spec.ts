import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { InventoryService } from '../../../core/services/inventory.service';
import {
  clearStorages,
  flushInventoryCreateRequest,
  flushInventoryDeleteRequest,
  flushInventoryUpdateRequest,
  seedInventoryCache,
} from '../../../testing/test-helpers';
import { InventoryForm } from './inventory-form';

describe('InventoryForm', () => {
  describe('modo create', () => {
    let component: InventoryForm;
    let inventoryService: InventoryService;
    let router: Router;

    beforeEach(async () => {
      clearStorages();

      await TestBed.configureTestingModule({
        imports: [InventoryForm],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: convertToParamMap({}),
              },
            },
          },
        ],
      }).compileComponents();

      inventoryService = TestBed.inject(InventoryService);
      seedInventoryCache();
      router = TestBed.inject(Router);
      component = TestBed.createComponent(InventoryForm).componentInstance;
      component.ngOnInit();
    });

    it('should create en modo alta', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode).toBe(false);
      expect(component.submitLabel).toBe('Crear producto');
    });

    it('muestra error al intentar crear con datos invalidos', () => {
      component.itemForm.controls.name.setValue('');

      component.onSubmit();

      expect(component.alertType).toBe('danger');
      expect(component.alertMessage).toContain('campos del formulario');
    });

    it('crea el producto y navega a su detalle', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const countBefore = inventoryService.getInventory().length;

      component.itemForm.patchValue({
        name: 'Gomitas nuevas',
        category: 'gomitas',
        size: 'small',
        price: 1500,
        image: 'assets/img/categories/gummies/candy-gummy-bears.jpg',
        description: 'Nuevas gomitas de prueba para el inventario.',
        discount: 10,
        stock: 10,
      });

      component.onSubmit();
      flushInventoryCreateRequest(100);

      const created = inventoryService.getInventory().find((item) => item.name === 'Gomitas nuevas');
      expect(inventoryService.getInventory().length).toBe(countBefore + 1);
      expect(created?.id).toBe(100);
      expect(navigateSpy).toHaveBeenCalledWith(['/inventario', 100]);
    });
  });

  describe('modo edit', () => {
    const itemId = 1;
    let component: InventoryForm;
    let inventoryService: InventoryService;

    beforeEach(async () => {
      clearStorages();

      await TestBed.configureTestingModule({
        imports: [InventoryForm],
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
      component = TestBed.createComponent(InventoryForm).componentInstance;
      component.ngOnInit();
    });

    it('should create en modo edicion', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode).toBe(true);
      expect(component.item?.id).toBe(itemId);
      expect(component.submitLabel).toBe('Guardar cambios');
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

    it('redirige al listado si el producto no existe', async () => {
      clearStorages();
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [InventoryForm],
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
      const fixture = TestBed.createComponent(InventoryForm);
      fixture.componentInstance.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/inventario']);
    });
  });
});
