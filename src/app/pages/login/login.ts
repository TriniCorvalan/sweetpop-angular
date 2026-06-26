import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

/**
 * Página de inicio de sesión con redirección según rol.
 * @usageNotes Ruta `/inicio-sesion`; protegida por `guestGuard`.
 */
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

  /**
   * Valida el formulario e intenta iniciar sesión.
   * @returns void
   * @usageNotes Redirige a inventario (admin) o inicio (cliente) tras éxito.
   */
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

  /**
   * Limpia alertas de validación del formulario.
   * @returns void
   * @usageNotes Invocado antes de revalidar en `onSubmit`.
   */
  clearValidation(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  /**
   * Indica si un control debe mostrarse como inválido.
   * @param controlName Nombre del control (`credential` o `password`).
   * @returns `true` si el control está inválido y fue tocado.
   * @usageNotes Usado en la plantilla para clases CSS de error.
   */
  isInvalid(controlName: 'credential' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
