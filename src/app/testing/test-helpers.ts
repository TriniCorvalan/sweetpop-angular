/** @ignore */

import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { expect } from 'vitest';

import { INITIAL_STOCK, STORAGE_KEYS } from '../core/constants/storage-keys';
import { INVENTORY_API_URL } from '../core/constants/api.constants';
import { BOX_CATALOG } from '../core/data/box-catalog';
import { CANDY_CATALOG } from '../core/data/candy-catalog';
import { BoxDraft } from '../core/models/box-draft.model';
import { CartItem } from '../core/models/cart-item.model';
import { InventoryItem } from '../core/models/inventory-item.model';
import { Session } from '../core/models/session.model';
import { User, UserRole } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { CatalogService } from '../core/services/catalog.service';
import { InventoryService } from '../core/services/inventory.service';
import { StorageService } from '../core/services/storage.service';

export const VALID_PASSWORD = 'Cliente1!';

export const VALID_REGISTER_FORM = {
  fullName: 'Nombre Test',
  username: 'cliente2',
  email: 'cliente2@test.cl',
  password: VALID_PASSWORD,
  passwordConfirm: VALID_PASSWORD,
  birthdate: '2000-05-15',
  address: 'Calle 123',
};

export const SAMPLE_BOX_CALCULATION = {
  boxId: 'box-simple' as const,
  boxName: 'Caja simple',
  boxPrice: 4990,
  discount: 0.1,
  candiesSubtotal: 10400,
  discountAmount: 1539,
  total: 13851,
};

export function createSampleCompleteBoxDraft(): BoxDraft {
  return {
    boxId: SAMPLE_BOX_CALCULATION.boxId,
    boxName: SAMPLE_BOX_CALCULATION.boxName,
    wallsCount: 4,
    boxPrice: SAMPLE_BOX_CALCULATION.boxPrice,
    discount: SAMPLE_BOX_CALCULATION.discount,
    walls: [
      {
        wallIndex: 1,
        productId: 1,
        productName: 'Dulce 1',
        price: 500,
        size: 'large',
        quantity: 4,
      },
      {
        wallIndex: 2,
        productId: 2,
        productName: 'Dulce 2',
        price: 600,
        size: 'large',
        quantity: 4,
      },
      {
        wallIndex: 3,
        productId: 3,
        productName: 'Dulce 3',
        price: 700,
        size: 'large',
        quantity: 4,
      },
      {
        wallIndex: 4,
        productId: 4,
        productName: 'Dulce 4',
        price: 800,
        size: 'large',
        quantity: 4,
      },
    ],
  };
}

export function createSampleCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const draft = createSampleCompleteBoxDraft();
  return {
    cartItemId: 'cart-test-1',
    boxId: draft.boxId,
    boxName: draft.boxName,
    boxPrice: draft.boxPrice,
    discount: draft.discount,
    walls: draft.walls.map((wall) => ({ ...wall })),
    candiesSubtotal: SAMPLE_BOX_CALCULATION.candiesSubtotal,
    total: SAMPLE_BOX_CALCULATION.total,
    ...overrides,
  };
}

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

/** Simula la respuesta de la API de cajas en pruebas unitarias. */
export function flushBoxesRequest(): void {
  const catalog = TestBed.inject(CatalogService);
  const httpMock = TestBed.inject(HttpTestingController);
  const request = httpMock.expectOne(catalog.boxesUrl);
  request.flush(BOX_CATALOG);
}

/** Inventario semilla equivalente a `db.json` para pruebas. */
export function createSeedInventoryItems(): InventoryItem[] {
  return CANDY_CATALOG.map((candy) => ({
    id: candy.id,
    name: candy.name,
    category: candy.category,
    size: candy.size,
    price: candy.price,
    image: candy.image,
    description: candy.description,
    discount: candy.discount,
    stock: INITIAL_STOCK,
  }));
}

/** Precarga el inventario en localStorage sin llamar a la API. */
export function seedInventoryCache(items = createSeedInventoryItems()): void {
  TestBed.inject(InventoryService).setLocalInventory(items);
}

/** Responde un POST a `/inventory` con el body enviado más un id generado. */
export function flushInventoryCreateRequest(id = 100): void {
  const httpMock = TestBed.inject(HttpTestingController);
  const request = httpMock.expectOne(INVENTORY_API_URL);
  expect(request.request.method).toBe('POST');
  request.flush({ id, ...request.request.body });
}

/** Responde un PUT a `/inventory/:id`. */
export function flushInventoryUpdateRequest(id: number): void {
  const httpMock = TestBed.inject(HttpTestingController);
  const request = httpMock.expectOne(`${INVENTORY_API_URL}/${id}`);
  expect(request.request.method).toBe('PUT');
  request.flush(request.request.body);
}

/** Responde un DELETE a `/inventory/:id`. */
export function flushInventoryDeleteRequest(id: number): void {
  const httpMock = TestBed.inject(HttpTestingController);
  const request = httpMock.expectOne(`${INVENTORY_API_URL}/${id}`);
  expect(request.request.method).toBe('DELETE');
  request.flush({});
}

export async function configureComponentTestingModule(
  metadata: TestModuleMetadata,
): Promise<void> {
  clearStorages();
  await TestBed.configureTestingModule(metadata).compileComponents();
}
