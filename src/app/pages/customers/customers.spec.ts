import { TestBed } from '@angular/core/testing';

import { clearStorages, createTestUser, seedUser } from '../../testing/test-helpers';
import { Customers } from './customers';

describe('Customers', () => {
  let component: Customers;

  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Customers],
    }).compileComponents();

    component = TestBed.createComponent(Customers).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lista solo usuarios con rol cliente', () => {
    seedUser(createTestUser({ id: 'admin-1', username: 'admin', role: 'admin' }));
    seedUser(createTestUser({ id: 'user-1', username: 'cliente1', role: 'user' }));
    seedUser(createTestUser({ id: 'user-2', username: 'cliente2', role: 'user', email: 'cliente2@test.cl' }));

    expect(component.customers).toHaveLength(2);
    expect(component.customers.every((customer) => customer.role === 'user')).toBe(true);
  });

  it('muestra un guion cuando el cliente no tiene direccion', () => {
    const user = createTestUser({ address: '' });

    expect(component.getAddress(user)).toBe('—');
    expect(component.getAddress({ ...user, address: 'Av. Central 100' })).toBe('Av. Central 100');
  });
});
