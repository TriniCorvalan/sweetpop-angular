import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { clearStorages, seedSession } from '../../testing/test-helpers';
import { Profile } from './profile';

describe('Profile', () => {
  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Profile],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Profile);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('redirige a inicio de sesion si no hay usuario autenticado', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    TestBed.createComponent(Profile).detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/inicio-sesion']);
  });

  it('actualiza la direccion de despacho del cliente', () => {
    seedSession('user', {
      id: 'user-profile',
      username: 'cliente1',
      address: 'Direccion antigua',
    });
    const auth = TestBed.inject(AuthService);
    const component = TestBed.createComponent(Profile).componentInstance;
    component.ngOnInit();

    component.profileForm.controls.address.setValue('Nueva direccion 456');
    component.onSubmit();

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toBe('Dirección de despacho actualizada correctamente.');
    expect(auth.findUserById('user-profile')?.address).toBe('Nueva direccion 456');
  });
});
