import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  credential = '';
  password = '';
  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';
  credentialInvalid = false;
  passwordInvalid = false;

  onSubmit(): void {
    this.alertType = null;
    this.alertMessage = '';
    this.credentialInvalid = this.credential.trim() === '';
    this.passwordInvalid = this.password === '';

    if (this.credentialInvalid || this.passwordInvalid) {
      this.alertType = 'danger';
      this.alertMessage = 'Completa todos los campos requeridos.';
      return;
    }

    const result = this.auth.login(this.credential, this.password);

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
    this.credentialInvalid = false;
    this.passwordInvalid = false;
  }
}
