import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { User } from '../../core/models/user.model';
import {
  birthdateValidator,
  emailValidator,
  passwordMatchValidator,
  passwordStrengthValidator,
  usernameValidator,
} from '../../core/utils/form-validators';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly fb = inject(FormBuilder);

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  registerForm = this.fb.nonNullable.group(
    {
      fullName: ['', Validators.required],
      username: ['', [Validators.required, usernameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      passwordConfirm: ['', Validators.required],
      birthdate: ['', [Validators.required, birthdateValidator()]],
      address: [''],
    },
    { validators: passwordMatchValidator() },
  );

  onSubmit(): void {
    this.clearAlerts();

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.alertType = 'danger';
      this.alertMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    const { fullName, username, email, password, birthdate, address } =
      this.registerForm.getRawValue();

    const normalizedUsername = username.trim();

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

    if (this.auth.findUserByEmail(email.trim())) {
      this.alertType = 'danger';
      this.alertMessage = 'Ese correo electrónico ya está registrado.';
      return;
    }

    const users = this.auth.getUsers();
    const newUser: User = {
      id: this.storage.generateId('user'),
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: email.trim(),
      password,
      role: 'user',
      birthdate,
      address: address.trim(),
      signupDate: new Date().toLocaleString(),
    };

    users.push(newUser);
    this.auth.saveUsers(users);

    this.registerForm.reset();
    this.alertType = 'success';
    this.alertMessage = 'Registro exitoso. Inicia sesión para continuar.';
  }

  onReset(): void {
    this.registerForm.reset();
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  isPasswordConfirmInvalid(): boolean {
    const confirm = this.registerForm.get('passwordConfirm');
    if (confirm?.invalid && confirm.touched) {
      return true;
    }
    return !!(this.registerForm.hasError('passwordMismatch') && confirm?.touched);
  }

  getPasswordFeedback(): string {
    const control = this.registerForm.get('password');
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
