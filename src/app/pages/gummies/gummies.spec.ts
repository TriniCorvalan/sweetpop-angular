import { TestBed } from '@angular/core/testing';

import { Gummies } from './gummies';

describe('Gummies', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gummies],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Gummies);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
