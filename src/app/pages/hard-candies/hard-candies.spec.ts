import { TestBed } from '@angular/core/testing';

import { HardCandies } from './hard-candies';

describe('HardCandies', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HardCandies],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HardCandies);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
