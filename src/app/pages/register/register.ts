import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { User } from '../../core/models/user.model';
import {
  getPasswordErrors,
  isValidBirthdate,
  isValidEmail,
  isValidUsername,
} from '../../core/utils/form-validators';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);

  fullName = '';
  username = '';
  email = '';
  password = '';
  passwordConfirm = '';
  birthdate = '';
  address = '';

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  fullNameInvalid = false;
  usernameInvalid = false;
  emailInvalid = false;
  passwordInvalid = false;
  passwordConfirmInvalid = false;
  birthdateInvalid = false;

  passwordError = '';
  passwordConfirmError = '';

  onSubmit(): void {
    this.clearAlerts();
    let formIsValid = true;

    if (this.fullName.trim() === '') {
      this.fullNameInvalid = true;
      formIsValid = false;
    }

    if (!isValidUsername(this.username)) {
      this.usernameInvalid = true;
      formIsValid = false;
    }

    if (!isValidEmail(this.email)) {
      this.emailInvalid = true;
      formIsValid = false;
    }

    const passwordErrors = getPasswordErrors(this.password, this.passwordConfirm);
    if (passwordErrors.length > 0) {
      this.passwordInvalid = passwordErrors.some((error) => !error.includes('coinciden'));
      this.passwordConfirmInvalid = passwordErrors.some((error) => error.includes('coinciden'));
      this.passwordError = passwordErrors.filter((error) => !error.includes('coinciden')).join('\n');
      this.passwordConfirmError = passwordErrors.filter((error) => error.includes('coinciden')).join('\n');
      formIsValid = false;
    }

    if (!isValidBirthdate(this.birthdate)) {
      this.birthdateInvalid = true;
      formIsValid = false;
    }

    if (!formIsValid) {
      this.alertType = 'danger';
      this.alertMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    const normalizedUsername = this.username.trim();

    if (normalizedUsername.toLowerCase() === 'admin') {
      this.alertType = 'danger';
      this.alertMessage = 'Ese nickname no está disponible para registro.';
      return;
    }

    if (this.auth.findUserByUsername(normalizedUsername)) {
      this.alertType = 'danger';
      this.alertMessage = 'Ese nickname ya está registrado.';
      return;
    }

    if (this.auth.findUserByEmail(this.email.trim())) {
      this.alertType = 'danger';
      this.alertMessage = 'Ese correo electrónico ya está registrado.';
      return;
    }

    const users = this.auth.getUsers();
    const newUser: User = {
      id: this.storage.generateId('user'),
      fullName: this.fullName.trim(),
      username: normalizedUsername,
      email: this.email.trim(),
      password: this.password,
      role: 'user',
      birthdate: this.birthdate,
      address: this.address.trim(),
      signupDate: new Date().toLocaleString(),
    };

    users.push(newUser);
    this.auth.saveUsers(users);

    this.resetForm();
    this.alertType = 'success';
    this.alertMessage = 'Registro exitoso. Inicia sesión para continuar.';
  }

  onReset(): void {
    this.resetForm();
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
    this.fullNameInvalid = false;
    this.usernameInvalid = false;
    this.emailInvalid = false;
    this.passwordInvalid = false;
    this.passwordConfirmInvalid = false;
    this.birthdateInvalid = false;
    this.passwordError = '';
    this.passwordConfirmError = '';
  }

  private resetForm(): void {
    this.fullName = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.passwordConfirm = '';
    this.birthdate = '';
    this.address = '';
  }
}
