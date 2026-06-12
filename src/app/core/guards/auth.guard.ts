import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

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
