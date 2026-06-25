import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../core/services/auth.service';
import {
  clearStorages,
  seedUser,
  VALID_PASSWORD,
  VALID_REGISTER_FORM,
} from '../../testing/test-helpers';
import { RecoverPassword } from './recover-password';

describe('RecoverPassword', () => {
  let component: RecoverPassword;
  let auth: AuthService;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [RecoverPassword],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    component = TestBed.createComponent(RecoverPassword).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra error si el correo no existe', () => {
    component.emailForm.setValue({ email: 'desconocido@test.cl' });

    component.onVerifyEmail();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('No encontramos una cuenta con ese correo.');
  });

  it('muestra el formulario de nueva contrasena para un cliente valido', () => {
    seedUser({ email: 'cliente1@test.cl', role: 'user' });
    component.emailForm.setValue({ email: 'cliente1@test.cl' });

    component.onVerifyEmail();

    expect(component.showEmailForm).toBe(false);
    expect(component.showPasswordForm).toBe(true);
    expect(component.alertType).toBe('info');
    expect(component.alertMessage).toContain('Correo verificado');
  });

  it('actualiza la contrasena del cliente', () => {
    seedUser({ email: 'cliente1@test.cl', password: 'Anterior1!', role: 'user' });
    component.emailForm.setValue({ email: 'cliente1@test.cl' });
    component.onVerifyEmail();

    const newPassword = 'NuevaClave1!';
    component.passwordForm.setValue({
      password: newPassword,
      passwordConfirm: newPassword,
    });

    component.onSavePassword();

    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toBe('Contraseña actualizada. Inicia sesión para continuar.');
    expect(auth.findUserByEmail('cliente1@test.cl')?.password).toBe(newPassword);
  });

  it('rechaza un correo con formato invalido', () => {
    component.emailForm.setValue({ email: 'correo-sin-formato' });

    component.onVerifyEmail();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Ingresa un correo electrónico válido.');
    expect(component.emailForm.controls.email.hasError('invalidEmail')).toBe(true);
  });

  it('rechaza una nueva contrasena que no cumple la complejidad', () => {
    seedUser({ email: 'cliente1@test.cl', role: 'user' });
    component.emailForm.setValue({ email: 'cliente1@test.cl' });
    component.onVerifyEmail();

    component.passwordForm.setValue({
      password: 'debil',
      passwordConfirm: 'debil',
    });

    component.onSavePassword();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toBe('Revisa los requisitos de la nueva contraseña.');
    expect(component.passwordForm.controls.password.hasError('passwordStrength')).toBe(true);
  });

  it('limpia el formulario de contrasena al verificar el correo', () => {
    seedUser({ email: 'cliente1@test.cl', role: 'user' });
    component.passwordForm.setValue({
      password: 'Basura1!',
      passwordConfirm: 'Basura1!',
    });

    component.emailForm.setValue({ email: 'cliente1@test.cl' });
    component.onVerifyEmail();

    expect(component.passwordForm.value).toEqual({
      password: '',
      passwordConfirm: '',
    });
  });

  it('rechaza la recuperacion para cuentas de administrador', () => {
    seedUser({
      email: 'admin@test.cl',
      username: 'administrador',
      role: 'admin',
      password: VALID_PASSWORD,
    });
    component.emailForm.setValue({ email: 'admin@test.cl' });

    component.onVerifyEmail();

    expect(component.alertType).toBe('danger');
    expect(component.alertMessage).toContain('no está disponible para cuentas de administrador');
    expect(component.showPasswordForm).toBe(false);
  });
});
