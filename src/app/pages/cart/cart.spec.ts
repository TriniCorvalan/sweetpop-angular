import { TestBed } from '@angular/core/testing';

import { Cart } from './cart';

describe('Cart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Cart);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
