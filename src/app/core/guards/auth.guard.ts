import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

/**
 * Exige sesión activa y rol permitido según `data.roles` de la ruta.
 * @param route Ruta activada con metadatos de roles permitidos.
 * @returns `true` si la sesión cumple el rol; `UrlTree` de redirección en caso contrario.
 * @usageNotes Registrado en `app.routes` para carrito, perfil, inventario y clientes.
 */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = auth.getSession();
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!session) {
    return router.createUrlTree(['/inicio-sesion']);
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    if (session.role === 'admin') {
      return router.createUrlTree(['/inventario']);
    }
    return router.createUrlTree(['/']);
  }

  return true;
};
