import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { getPasswordErrors, isValidEmail } from '../../core/utils/form-validators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recover-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './recover-password.html',
})
export class RecoverPassword {
  private readonly auth = inject(AuthService);

  intro = 'Ingresa el correo de tu cuenta de cliente para restablecer tu contraseña.';
  email = '';
  password = '';
  passwordConfirm = '';
  recoveryEmail = '';

  showEmailForm = true;
  showPasswordForm = false;

  alertType: 'success' | 'danger' | 'info' | null = null;
  alertMessage = '';
  emailInvalid = false;
  passwordInvalid = false;
  passwordConfirmInvalid = false;

  onVerifyEmail(): void {
    this.clearAlerts();
    this.emailInvalid = !isValidEmail(this.email);

    if (this.emailInvalid) {
      this.alertType = 'danger';
      this.alertMessage = 'Ingresa un correo electrónico válido.';
      return;
    }

    const user = this.auth.findUserByEmail(this.email);

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
    this.intro = `Crea una nueva contraseña para ${user.email}.`;
    this.alertType = 'info';
    this.alertMessage = 'Correo verificado. Ahora define tu nueva contraseña.';
  }

  onSavePassword(): void {
    this.clearAlerts();
    const errors = getPasswordErrors(this.password, this.passwordConfirm);

    if (errors.length > 0) {
      this.passwordInvalid = errors.some((error) => !error.includes('coinciden'));
      this.passwordConfirmInvalid = errors.some((error) => error.includes('coinciden'));
      this.alertType = 'danger';
      this.alertMessage = 'Revisa los requisitos de la nueva contraseña.';
      return;
    }

    const users = this.auth.getUsers();
    const userIndex = users.findIndex(
      (user) => user.email.toLowerCase() === this.recoveryEmail.toLowerCase(),
    );

    if (userIndex === -1) {
      this.alertType = 'danger';
      this.alertMessage = 'No fue posible actualizar la contraseña. Intenta de nuevo.';
      return;
    }

    users[userIndex].password = this.password;
    this.auth.saveUsers(users);

    this.showPasswordForm = false;
    this.intro = 'Tu contraseña fue actualizada correctamente.';
    this.alertType = 'success';
    this.alertMessage = 'Contraseña actualizada. Inicia sesión para continuar.';
  }

  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
    this.emailInvalid = false;
    this.passwordInvalid = false;
    this.passwordConfirmInvalid = false;
  }
}
