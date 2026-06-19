import { TestBed } from '@angular/core/testing';

import { Logout } from './logout';

describe('Logout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logout],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Logout);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
