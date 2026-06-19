import { TestBed } from '@angular/core/testing';

import { Chocolates } from './chocolates';

describe('Chocolates', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chocolates],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Chocolates);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
