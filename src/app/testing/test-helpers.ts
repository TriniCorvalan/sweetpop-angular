import { TestBed, TestModuleMetadata } from '@angular/core/testing';

import { STORAGE_KEYS } from '../core/constants/storage-keys';
import { Session } from '../core/models/session.model';
import { User, UserRole } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { StorageService } from '../core/services/storage.service';

export function clearStorages(): void {
  localStorage.clear();
  sessionStorage.clear();
}

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-test-1',
    username: 'cliente1',
    email: 'cliente1@sweetpop.cl',
    password: 'Cliente1!',
    role: 'user',
    fullName: 'Cliente de Prueba',
    birthdate: '2000-01-15',
    address: 'Av. Providencia 123',
    signupDate: '2026-01-01',
    ...overrides,
  };
}

export function createTestSession(user: User): Session {
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  };
}

export function seedUser(overrides: Partial<User> = {}): User {
  const storage = new StorageService();
  const user = createTestUser(overrides);
  const users = storage.readJson<User[]>(localStorage, STORAGE_KEYS.users, []);
  const index = users.findIndex((item) => item.id === user.id);

  if (index === -1) {
    users.push(user);
  } else {
    users[index] = user;
  }

  storage.writeJson(localStorage, STORAGE_KEYS.users, users);
  return user;
}

export function seedSession(role: UserRole = 'user', userOverrides: Partial<User> = {}): User {
  const user = seedUser({ role, ...userOverrides });
  const storage = new StorageService();
  storage.writeJson(sessionStorage, STORAGE_KEYS.session, createTestSession(user));
  return user;
}

export function seedAdminUser(): User {
  const auth = TestBed.inject(AuthService);
  auth.ensureAdminUser();
  return auth.getUsers().find((user) => user.role === 'admin')!;
}

export async function configureComponentTestingModule(
  metadata: TestModuleMetadata,
): Promise<void> {
  clearStorages();
  await TestBed.configureTestingModule(metadata).compileComponents();
}
