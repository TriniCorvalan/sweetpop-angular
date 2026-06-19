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
});
