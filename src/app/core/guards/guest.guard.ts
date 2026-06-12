import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

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
