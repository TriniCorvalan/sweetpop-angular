import { TestBed } from '@angular/core/testing';

import { Customers } from './customers';

describe('Customers', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customers],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Customers);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
