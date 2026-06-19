import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';

  loginForm = this.fb.nonNullable.group({
    credential: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    this.clearValidation();

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.alertType = 'danger';
      this.alertMessage = 'Completa todos los campos requeridos.';
      return;
    }

    const { credential, password } = this.loginForm.getRawValue();
    const result = this.auth.login(credential.trim(), password);

    if (!result.success) {
      this.alertType = 'danger';
      this.alertMessage = result.message;
      return;
    }

    this.alertType = 'success';
    this.alertMessage = `${result.message} Redirigiendo...`;

    setTimeout(() => {
      if (result.user?.role === 'admin') {
        this.router.navigate(['/inventario']);
      } else {
        this.router.navigate(['/']);
      }
    }, 800);
  }

  clearValidation(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  isInvalid(controlName: 'credential' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
