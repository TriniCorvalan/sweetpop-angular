import { TestBed } from '@angular/core/testing';

import { Boxes } from './boxes';

describe('Boxes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boxes],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Boxes);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
