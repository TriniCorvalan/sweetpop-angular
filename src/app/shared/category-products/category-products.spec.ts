import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { BoxDraftService } from '../../core/services/box-draft.service';
import { InventoryService } from '../../core/services/inventory.service';
import {
  clearStorages,
  flushBoxesRequest,
  flushInventoryCreateRequest,
  seedInventoryCache,
  seedSession,
} from '../../testing/test-helpers';
import { CategoryProducts } from './category-products';

describe('CategoryProducts', () => {
  let component: CategoryProducts;
  let boxDraftService: BoxDraftService;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [CategoryProducts],
    }).compileComponents();

    seedInventoryCache();
    boxDraftService = TestBed.inject(BoxDraftService);

    const fixture = TestBed.createComponent(CategoryProducts);
    component = fixture.componentInstance;
    component.category = 'gomitas';
    component.title = 'Gomitas';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra alerta informativa si no hay borrador de caja', () => {
    component.ngOnInit();

    expect(component.alertType).toBe('info');
    expect(component.alertMessage).toContain('Selecciona una caja en Cajas');
    expect(component.products.every((product) => product.disabled)).toBe(true);
  });

  it('muestra exito al asignar un dulce con borrador activo', async () => {
    seedSession('user');
    const startPromise = firstValueFrom(boxDraftService.startBoxDraft('box-simple'));
    flushBoxesRequest();
    await startPromise;

    component.ngOnInit();
    component.assignProduct(1);

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toContain('Ositos de gomita');
  });

  it('incluye productos creados en inventario dentro de la categoria', () => {
    const inventoryService = TestBed.inject(InventoryService);
    inventoryService
      .createItem({
        name: 'Caramelo nuevo',
        category: 'caramelos',
        size: 'small',
        price: 990,
        image: 'assets/img/categories/hard-candies/candy-lollipop.jpg',
        description: 'Caramelo creado desde inventario para la categoría.',
        discount: 5,
        stock: 12,
      })
      .subscribe();
    flushInventoryCreateRequest(50);

    component.category = 'caramelos';
    component.title = 'Caramelos';
    component.ngOnInit();

    const created = component.candies.find((candy) => candy.name === 'Caramelo nuevo');
    expect(created).toBeTruthy();
    expect(created?.description).toBe('Caramelo creado desde inventario para la categoría.');
    expect(created?.discount).toBe(5);
  });
});
