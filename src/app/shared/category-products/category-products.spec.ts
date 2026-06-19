import { TestBed } from '@angular/core/testing';

import { BoxDraftService } from '../../core/services/box-draft.service';
import { InventoryService } from '../../core/services/inventory.service';
import { clearStorages, seedSession } from '../../testing/test-helpers';
import { CategoryProducts } from './category-products';

describe('CategoryProducts', () => {
  let component: CategoryProducts;
  let boxDraftService: BoxDraftService;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [CategoryProducts],
    }).compileComponents();

    TestBed.inject(InventoryService).ensureInventory();
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

  it('muestra exito al asignar un dulce con borrador activo', () => {
    seedSession('user');
    boxDraftService.startBoxDraft('box-simple');

    component.ngOnInit();
    component.assignProduct('gom-gummy-bears');

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toContain('Ositos de gomita');
  });
});
