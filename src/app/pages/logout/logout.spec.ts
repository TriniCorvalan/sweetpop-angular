import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { clearStorages, seedSession } from '../../testing/test-helpers';
import { Logout } from './logout';

describe('Logout', () => {
  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Logout],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Logout);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('cierra sesion y redirige al inicio', () => {
    seedSession('user');
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const logoutSpy = vi.spyOn(auth, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    expect(auth.isLoggedIn()).toBe(true);

    TestBed.createComponent(Logout).detectChanges();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
