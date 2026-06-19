import { TestBed } from '@angular/core/testing';

import { Profile } from './profile';

describe('Profile', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Profile);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
