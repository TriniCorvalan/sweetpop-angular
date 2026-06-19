import { TestBed } from '@angular/core/testing';

import { RecoverPassword } from './recover-password';

describe('RecoverPassword', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoverPassword],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RecoverPassword);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
