import { TestBed } from '@angular/core/testing';

import { NavLinks } from './nav-links';

describe('NavLinks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavLinks],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavLinks);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
