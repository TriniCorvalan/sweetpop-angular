import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  fullName = '';
  username = '';
  email = '';
  birthdate = '';
  signupDate = '';
  address = '';

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';
  private userId = '';

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/inicio-sesion']);
      return;
    }

    this.loadProfile(currentUser);
  }

  onSubmit(): void {
    this.alertType = null;
    this.alertMessage = '';

    if (!this.userId) {
      this.alertType = 'danger';
      this.alertMessage = 'No se encontró tu cuenta. Inicia sesión nuevamente.';
      return;
    }

    const updated = this.auth.updateUser(this.userId, { address: this.address.trim() });

    if (!updated) {
      this.alertType = 'danger';
      this.alertMessage = 'No se encontró tu cuenta. Inicia sesión nuevamente.';
      return;
    }

    const user = this.auth.findUserById(this.userId);
    if (user) {
      this.loadProfile(user);
    }

    this.alertType = 'success';
    this.alertMessage = 'Dirección de despacho actualizada correctamente.';
  }

  private loadProfile(user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    birthdate: string;
    address: string;
    signupDate: string;
  }): void {
    this.userId = user.id;
    this.fullName = user.fullName || '';
    this.username = user.username || '';
    this.email = user.email || '';
    this.birthdate = user.birthdate || '';
    this.address = user.address || '';
    this.signupDate = user.signupDate || '';
  }
}
