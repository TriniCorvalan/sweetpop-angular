import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Permite acceso solo a visitantes sin sesión activa.
 * @returns `true` sin sesión; `UrlTree` hacia inicio o inventario si ya hay sesión.
 * @usageNotes Registrado en `app.routes` para login, registro y recuperar contraseña.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = auth.getSession();

  if (!session) {
    return true;
  }

  if (session.role === 'admin') {
    return router.createUrlTree(['/inventario']);
  }

  return router.createUrlTree(['/']);
};
