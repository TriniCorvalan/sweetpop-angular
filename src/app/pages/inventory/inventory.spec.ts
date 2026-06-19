import { TestBed } from '@angular/core/testing';

import { Inventory } from './inventory';

describe('Inventory', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventory],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Inventory);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
