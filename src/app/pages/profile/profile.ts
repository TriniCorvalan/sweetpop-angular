import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { hasValidUsernameFormat, isUsernameAvailable, usernameValidator } from '../../core/utils/form-validators';

/**
 * Página de perfil: visualiza datos de cuenta y actualiza nombre, nickname y dirección.
 * @usageNotes Ruta `/perfil`; requiere rol `user` vía `authGuard`.
 */
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
    fullName: ['', Validators.required],
    username: ['', [Validators.required, usernameValidator()]],
    email: [''],
    birthdate: [''],
    signupDate: [''],
    address: [''],
  });

  /**
   * Carga los datos del usuario autenticado en el formulario.
   * @returns void
   * @usageNotes Redirige a login si no hay sesión activa.
   */
  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/inicio-sesion']);
      return;
    }

    this.loadProfile(currentUser);
  }

  /**
   * Persiste nombre, nickname y dirección de despacho editados.
   * @returns void
   * @usageNotes Rechaza nicknames reservados o ya registrados por otro usuario.
   */
  onSubmit(): void {
    this.clearAlerts();

    if (!this.userId) {
      this.alertType = 'danger';
      this.alertMessage = 'No se encontró tu cuenta. Inicia sesión nuevamente.';
      return;
    }

    const usernameControl = this.profileForm.controls.username;
    usernameControl.markAsTouched();
    if (hasValidUsernameFormat(usernameControl.value)) {
      this.checkUsernameAvailability(usernameControl.value);
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.alertType = 'danger';
      this.alertMessage = 'Por favor, completa los campos editables correctamente.';
      return;
    }

    const { fullName, username, address } = this.profileForm.getRawValue();
    const normalizedFullName = fullName.trim();
    const normalizedUsername = username.trim();

    const updated = this.auth.updateUser(this.userId, {
      fullName: normalizedFullName,
      username: normalizedUsername,
      address: address.trim(),
    });

    if (!updated) {
      this.alertType = 'danger';
      this.alertMessage = 'No se encontró tu cuenta. Inicia sesión nuevamente.';
      return;
    }

    this.syncSession({
      fullName: normalizedFullName,
      username: normalizedUsername,
    });

    const user = this.auth.findUserById(this.userId);
    if (user) {
      this.loadProfile(user);
    }

    this.alertType = 'success';
    this.alertMessage = 'Perfil actualizado correctamente.';
  }

  /**
   * Verifica disponibilidad del nickname al salir del campo.
   * @returns void
   * @usageNotes Solo valida si el valor cumple largo y formato mínimos.
   */
  onUsernameBlur(): void {
    const control = this.profileForm.controls.username;
    control.markAsTouched();
    this.checkUsernameAvailability(control.value);
  }

  /**
   * Limpia alertas y el error de disponibilidad mientras se edita el nickname.
   * @returns void
   * @usageNotes Invocado desde el evento `input` del campo nickname.
   */
  onUsernameInput(): void {
    this.clearAlerts();
    this.setUsernameUnavailableError(this.profileForm.controls.username, false);
  }

  /**
   * Limpia mensajes de alerta del formulario.
   * @returns void
   * @usageNotes Invocado antes de revalidar en `onSubmit` y al editar campos.
   */
  clearAlerts(): void {
    this.alertType = null;
    this.alertMessage = '';
  }

  /**
   * Indica si un control del formulario debe mostrarse como inválido.
   * @param controlName Nombre del `FormControl`.
   * @returns `true` si el control está inválido y fue tocado.
   * @usageNotes Usado en la plantilla para clases CSS de error.
   */
  isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Retorna el mensaje de error visible para el nickname.
   * @returns Texto de feedback según el error activo del control.
   * @usageNotes Mostrado bajo el campo nickname en la plantilla.
   */
  getUsernameFeedback(): string {
    const control = this.profileForm.controls.username;

    if (!control.touched) {
      return 'El nickname debe tener entre 6 y 20 caracteres válidos.';
    }
    if (control.hasError('required')) {
      return 'El nickname es obligatorio.';
    }
    if (control.hasError('usernameUnavailable')) {
      return 'Este nickname no está disponible.';
    }
    return 'El nickname debe tener entre 6 y 20 caracteres válidos.';
  }

  private checkUsernameAvailability(username: string): void {
    const control = this.profileForm.controls.username;

    if (!hasValidUsernameFormat(username)) {
      this.setUsernameUnavailableError(control, false);
      return;
    }

    const available = isUsernameAvailable(username, this.auth.getUsers(), this.userId);
    this.setUsernameUnavailableError(control, !available);
  }

  private setUsernameUnavailableError(control: AbstractControl, unavailable: boolean): void {
    const currentErrors = control.errors ?? {};

    if (unavailable) {
      control.setErrors({ ...currentErrors, usernameUnavailable: true });
      return;
    }

    const { usernameUnavailable: _removed, ...remainingErrors } = currentErrors;
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
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
    this.profileForm.patchValue(
      {
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        birthdate: user.birthdate || '',
        signupDate: user.signupDate || '',
        address: user.address || '',
      },
      { emitEvent: false },
    );
  }

  private syncSession(updates: { fullName: string; username: string }): void {
    const session = this.auth.getSession();
    if (session?.userId === this.userId) {
      this.auth.setSession({ ...session, ...updates });
    }
  }
}
