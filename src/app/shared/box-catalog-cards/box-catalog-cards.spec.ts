import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { BoxDraftService } from '../../core/services/box-draft.service';
import { clearStorages, seedInventoryCache, seedSession } from '../../testing/test-helpers';
import { BoxCatalogCards } from './box-catalog-cards';

describe('BoxCatalogCards', () => {
  let component: BoxCatalogCards;
  let router: Router;
  let boxDraftService: BoxDraftService;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [BoxCatalogCards],
    }).compileComponents();

    seedInventoryCache();
    router = TestBed.inject(Router);
    boxDraftService = TestBed.inject(BoxDraftService);

    const fixture = TestBed.createComponent(BoxCatalogCards);
    component = fixture.componentInstance;
    component.view = 'catalog';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirige a inicio de sesion si el visitante intenta personalizar una caja', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.customizeBox('box-simple');

    expect(navigateSpy).toHaveBeenCalledWith(['/inicio-sesion']);
  });

  it('inicia el borrador y navega a dulces cuando hay sesion de cliente', () => {
    seedSession('user');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const startSpy = vi
      .spyOn(boxDraftService, 'startBoxDraft')
      .mockReturnValue(of({ success: true, message: 'Caja simple seleccionada.' }));

    component.customizeBox('box-simple');

    expect(startSpy).toHaveBeenCalledWith('box-simple', false);
    expect(navigateSpy).toHaveBeenCalledWith(['/dulces']);
  });
});
