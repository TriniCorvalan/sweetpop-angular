import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { clearStorages, seedSession } from '../../testing/test-helpers';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  const runGuard = (routeData: Record<string, unknown> = {}) =>
    TestBed.runInInjectionContext(
      () => authGuard({ data: routeData } as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as GuardResult;

  beforeEach(() => {
    clearStorages();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  it('redirige a inicio de sesion si no hay sesion activa', () => {
    const result = runGuard({ roles: ['user'] });

    expect(result).toEqual(router.createUrlTree(['/inicio-sesion']));
  });

  it('permite el acceso cuando el rol coincide con la ruta', () => {
    seedSession('user');

    const result = runGuard({ roles: ['user'] });

    expect(result).toBe(true);
  });

  it('redirige al admin fuera de rutas reservadas para clientes', () => {
    seedSession('admin', { id: 'admin-test', username: 'admin' });

    const result = runGuard({ roles: ['user'] });

    expect(result).toEqual(router.createUrlTree(['/inventario']));
  });

  it('redirige al cliente fuera de rutas reservadas para admin', () => {
    seedSession('user');

    const result = runGuard({ roles: ['admin'] });

    expect(result).toEqual(router.createUrlTree(['/']));
  });
});
