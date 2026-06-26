import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  emailValidator,
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../core/utils/form-validators';
import { AuthService } from '../../core/services/auth.service';

/**
 * Página de recuperación de contraseña en dos pasos (solo clientes).
 * @usageNotes Ruta `/recuperar-contrasena`; protegida por `guestGuard`.
 */
@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.html',
})
export class RecoverPassword {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  intro = 'Ingresa el correo de tu cuenta de cliente para restablecer tu contraseña.';
  recoveryEmail = '';

  showEmailForm = true;
  showPasswordForm = false;

  alertType: 'success' | 'danger' | 'info' | null = null;
  alertMessage = '';

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, emailValidator()]],
  });

  passwordForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, passwordStrengthValidator()]],
      passwordConfirm: ['', Validators.required],
    },
    { validators: passwordMatchValidator() },
  );

  /**
   * Verifica que el correo pertenezca a un cliente registrado.
   * @returns void
   * @usageNotes Paso 1: muestra formulario de nueva contraseña si el correo es válido.
   */
  onVerifyEmail(): void {
    this.clearAlerts();

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.alertType = 'danger';
      this.alertMessage = 'Ingresa un correo electrónico válido.';
      return;
    }

    const email = this.emailForm.getRawValue().email.trim();
    const user = this.auth.findUserByEmail(email);

    if (!user) {
      this.alertType = 'danger';
      this.alertMessage = 'No encontramos una cuenta con ese correo.';
      return;
    }

    if (user.role === 'admin') {
      this.alertType = 'danger';
      this.alertMessage =
        'La recuperación de contraseña no está disponible para cuentas de administrador.';
      return;
    }

    this.recoveryEmail = user.email;
    this.showEmailForm = false;
    this.showPasswordForm = true;
    this.passwordForm.reset();
    this.intro = `Crea una nueva contraseña para ${user.email}.`;
    this.alertType = 'info';
    this.alertMessage = 'Correo verificado. Ahora define tu nueva contraseña.';
  }

  /**
   * Persiste la nueva contraseña del cliente verificado.
   * @returns void
   * @usageNotes Paso 2: actualiza `localStorage` y muestra mensaje de éxito.
   */
  onSavePassword(): void {
    this.clearAlerts();

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.alertType = 'danger';
      this.alertMessage = 'Revisa los requisitos de la nueva contraseña.';
      return;
    }

    const { password } = this.passwordForm.getRawValue();
    const users = this.auth.getUsers();
    const userIndex = users.findIndex(
      (user) => user.email.toLowerCase() === this.recoveryEmail.toLowerCase(),
    );

    if (userIndex === -1) {
      this.alertType = 'danger';
      this.alertMessage = 'No fue posible actualizar la contraseña. Intenta de nuevo.';
      return;
    }

    users[userIndex].password = password;
    this.auth.saveUsers(users);

    this.showPasswordForm = false;
    this.intro = 'Tu contraseña fue actualizada correctamente.';
    this.alertType = 'success';
    this.alertMessage = 'Contraseña actualizada. Inicia sesión para continuar.';
  }

  /**
   * Limpia mensajes de alerta.
   * @returns void
   * @usageNotes Invocado antes de revalidar en cada paso.
   */
  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  /**
   * Indica si el campo correo es inválido y fue tocado.
   * @returns `true` si hay error visible en el paso 1.
   * @usageNotes Usado en la plantilla para clases CSS de error.
   */
  isEmailInvalid(): boolean {
    const control = this.emailForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Indica si el campo contraseña es inválido y fue tocado.
   * @returns `true` si hay error visible en el paso 2.
   * @usageNotes Usado en la plantilla para clases CSS de error.
   */
  isPasswordInvalid(): boolean {
    const control = this.passwordForm.get('password');
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Indica si la confirmación de contraseña es inválida o no coincide.
   * @returns `true` si hay error de confirmación visible.
   * @usageNotes Considera error de grupo `passwordMismatch`.
   */
  isPasswordConfirmInvalid(): boolean {
    const confirm = this.passwordForm.get('passwordConfirm');
    if (confirm?.invalid && confirm.touched) {
      return true;
    }
    return !!(this.passwordForm.hasError('passwordMismatch') && confirm?.touched);
  }

  /**
   * Retorna mensajes de feedback de fortaleza de contraseña.
   * @returns Texto con requisitos no cumplidos o mensaje genérico.
   * @usageNotes Mostrado bajo el campo contraseña en el paso 2.
   */
  getPasswordFeedback(): string {
    const control = this.passwordForm.get('password');
    if (!control?.invalid || !control.touched) {
      return 'La contraseña no cumple los requisitos.';
    }
    if (control.hasError('required')) {
      return 'La contraseña es obligatoria.';
    }
    const strength = control.getError('passwordStrength') as string[] | undefined;
    return strength?.join('\n') ?? 'La contraseña no cumple los requisitos.';
  }
}
