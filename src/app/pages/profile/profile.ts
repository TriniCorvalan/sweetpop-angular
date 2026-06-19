import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  alertType: 'success' | 'danger' | null = null;
  alertMessage = '';
  private userId = '';

  profileForm = this.fb.nonNullable.group({
    fullName: [''],
    username: [''],
    email: [''],
    birthdate: [''],
    signupDate: [''],
    address: [''],
  });

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

    const address = this.profileForm.controls.address.value.trim();
    const updated = this.auth.updateUser(this.userId, { address });

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
    this.profileForm.patchValue({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      birthdate: user.birthdate || '',
      signupDate: user.signupDate || '',
      address: user.address || '',
    });
  }
}
