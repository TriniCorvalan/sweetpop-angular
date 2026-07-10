import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { InventoryService } from '../../../core/services/inventory.service';
import {
  clearStorages,
  flushInventoryCreateRequest,
  seedInventoryCache,
} from '../../../testing/test-helpers';
import { InventoryCreate } from './inventory-create';

describe('InventoryCreate', () => {
  let component: InventoryCreate;
  let inventoryService: InventoryService;
  let router: Router;

  beforeEach(async () => {
    clearStorages();

    await TestBed.configureTestingModule({
      imports: [InventoryCreate],
      providers: [provideRouter([])],
    }).compileComponents();

    inventoryService = TestBed.inject(InventoryService);
    seedInventoryCache();
    router = TestBed.inject(Router);
    component = TestBed.createComponent(InventoryCreate).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    expect(created?.description).toBe('Nuevas gomitas de prueba para el inventario.');
    expect(created?.discount).toBe(10);
    expect(created?.stock).toBe(10);
    expect(navigateSpy).toHaveBeenCalledWith(['/inventario', 100]);
  });
});
