import { TestBed } from '@angular/core/testing';

import { Candies } from './candies';

describe('Candies', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Candies],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Candies);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
