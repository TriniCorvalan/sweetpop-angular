import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { clearStorages, seedSession, seedUser } from '../../testing/test-helpers';
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
    expect(component.alertMessage).toBe('Perfil actualizado correctamente.');
    expect(auth.findUserById('user-profile')?.address).toBe('Nueva direccion 456');
  });

  it('actualiza nombre y nickname del cliente', () => {
    seedSession('user', {
      id: 'user-profile',
      username: 'cliente1',
      fullName: 'Nombre Antiguo',
    });
    const auth = TestBed.inject(AuthService);
    const component = TestBed.createComponent(Profile).componentInstance;
    component.ngOnInit();

    component.profileForm.controls.fullName.setValue('Nombre Nuevo');
    component.profileForm.controls.username.setValue('clientenuevo');
    component.onSubmit();

    const user = auth.findUserById('user-profile');
    expect(component.alertType).toBe('success');
    expect(user?.fullName).toBe('Nombre Nuevo');
    expect(user?.username).toBe('clientenuevo');
    expect(auth.getSession()?.fullName).toBe('Nombre Nuevo');
    expect(auth.getSession()?.username).toBe('clientenuevo');
  });

  it('rechaza nickname duplicado de otro usuario', () => {
    seedUser({ id: 'otro-user', username: 'ocupado1' });
    seedSession('user', {
      id: 'user-profile',
      username: 'cliente1',
    });
    const component = TestBed.createComponent(Profile).componentInstance;
    component.ngOnInit();

    component.profileForm.controls.username.setValue('ocupado1');
    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Por favor, completa los campos editables correctamente.');
    expect(component.profileForm.controls.username.hasError('usernameUnavailable')).toBe(true);
  });

  it('marca nickname no disponible al salir del campo cuando cumple formato', () => {
    seedUser({ id: 'otro-user', username: 'ocupado1' });
    seedSession('user', {
      id: 'user-profile',
      username: 'cliente1',
    });
    const component = TestBed.createComponent(Profile).componentInstance;
    component.ngOnInit();

    component.profileForm.controls.username.setValue('ocupado1');
    component.onUsernameBlur();

    expect(component.profileForm.controls.username.hasError('usernameUnavailable')).toBe(true);
    expect(component.getUsernameFeedback()).toBe('Este nickname no está disponible.');
  });

  it('no marca error de disponibilidad si el nickname sigue siendo el propio', () => {
    seedSession('user', {
      id: 'user-profile',
      username: 'cliente1',
    });
    const component = TestBed.createComponent(Profile).componentInstance;
    component.ngOnInit();

    component.profileForm.controls.username.setValue('cliente1');
    component.onUsernameBlur();

    expect(component.profileForm.controls.username.hasError('usernameUnavailable')).toBeFalsy();
  });

  it('rechaza nickname invalido', () => {
    seedSession('user', {
      id: 'user-profile',
      username: 'cliente1',
    });
    const component = TestBed.createComponent(Profile).componentInstance;
    component.ngOnInit();

    component.profileForm.controls.username.setValue('abc');
    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Por favor, completa los campos editables correctamente.');
  });
});
