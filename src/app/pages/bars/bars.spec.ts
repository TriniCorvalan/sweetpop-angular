import { TestBed } from '@angular/core/testing';

import { Bars } from './bars';

describe('Bars', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bars],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Bars);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
