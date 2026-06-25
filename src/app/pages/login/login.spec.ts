import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../core/services/auth.service';
import { clearStorages, seedUser } from '../../testing/test-helpers';
import { Login } from './login';

describe('Login', () => {
  let component: Login;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Login],
    }).compileComponents();

    component = TestBed.createComponent(Login).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra error cuando el formulario esta vacio', () => {
    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Completa todos los campos requeridos.');
  });

  it('muestra error con credenciales incorrectas', () => {
    seedUser({ username: 'cliente1', password: 'Cliente1!' });
    component.loginForm.setValue({
      credential: 'cliente1',
      password: 'Incorrecta1!',
    });

    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Contraseña incorrecta.');
  });

  it('muestra exito con credenciales validas', () => {
    seedUser({ username: 'cliente1', password: 'Cliente1!' });
    component.loginForm.setValue({
      credential: 'cliente1',
      password: 'Cliente1!',
    });

    component.onSubmit();

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toContain('Inicio de sesión exitoso');
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(true);
  });

  it('limpia las alertas con clearValidation', () => {
    component.alertType = 'danger';
    component.alertMessage = 'Error de prueba';

    component.clearValidation();

    expect(component.alertType).toBeNull();
    expect(component.alertMessage).toBe('');
  });
});
