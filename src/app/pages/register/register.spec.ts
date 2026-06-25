import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../core/services/auth.service';
import {
  clearStorages,
  seedUser,
  VALID_REGISTER_FORM,
} from '../../testing/test-helpers';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let auth: AuthService;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Register],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    component = TestBed.createComponent(Register).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rechaza un nickname ya registrado', () => {
    seedUser({ username: 'cliente1', email: 'cliente1@test.cl' });
    component.registerForm.setValue({
      ...VALID_REGISTER_FORM,
      username: 'cliente1',
      email: 'otro@test.cl',
    });

    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Ese nickname ya está registrado.');
  });

  it('registra un nuevo cliente con datos validos', () => {
    component.registerForm.setValue(VALID_REGISTER_FORM);

    component.onSubmit();

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toBe('Registro exitoso. Inicia sesión para continuar.');
    expect(auth.findUserByUsername('cliente2')).toBeTruthy();
    expect(auth.findUserByEmail('cliente2@test.cl')).toBeTruthy();
  });

  it('rechaza un correo con formato invalido', () => {
    component.registerForm.setValue({
      ...VALID_REGISTER_FORM,
      email: 'correo-invalido',
    });

    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toContain('campos requeridos correctamente');
    expect(component.registerForm.controls.email.hasError('invalidEmail')).toBe(true);
  });

  it('rechaza una contrasena que no cumple la complejidad', () => {
    component.registerForm.setValue({
      ...VALID_REGISTER_FORM,
      password: 'corta',
      passwordConfirm: 'corta',
    });

    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.registerForm.controls.password.hasError('passwordStrength')).toBe(true);
  });

  it('rechaza un registro de menor de 13 anos', () => {
    const birthdate = new Date();
    birthdate.setFullYear(birthdate.getFullYear() - 12);

    component.registerForm.setValue({
      ...VALID_REGISTER_FORM,
      birthdate: birthdate.toISOString().slice(0, 10),
    });

    component.onSubmit();

    expect(component.alertType).toBe('danger');
    expect(component.registerForm.controls.birthdate.hasError('invalidBirthdate')).toBe(true);
  });

  it('limpia el formulario y las alertas con onReset', () => {
    component.registerForm.setValue(VALID_REGISTER_FORM);
    component.alertType = 'danger';
    component.alertMessage = 'Error de prueba';

    component.onReset();

    expect(component.registerForm.value).toEqual({
      fullName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      birthdate: '',
      address: '',
    });
    expect(component.alertType).toBeNull();
    expect(component.alertMessage).toBe('');
  });

  it('limpia el formulario despues de un registro exitoso', () => {
    component.registerForm.setValue(VALID_REGISTER_FORM);

    component.onSubmit();

    expect(component.alertType).toBe('success');
    expect(component.registerForm.value).toEqual({
      fullName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      birthdate: '',
      address: '',
    });
  });
});
