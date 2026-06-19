import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { clearStorages, seedSession } from '../../testing/test-helpers';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let router: Router;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as GuardResult;

  beforeEach(() => {
    clearStorages();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  it('permite el acceso cuando no hay sesion activa', () => {
    expect(runGuard()).toBe(true);
  });

  it('redirige al admin hacia inventario si ya inicio sesion', () => {
    seedSession('admin', { id: 'admin-test', username: 'admin' });

    expect(runGuard()).toEqual(router.createUrlTree(['/inventario']));
  });

  it('redirige al cliente hacia inicio si ya inicio sesion', () => {
    seedSession('user');

    expect(runGuard()).toEqual(router.createUrlTree(['/']));
  });
});
