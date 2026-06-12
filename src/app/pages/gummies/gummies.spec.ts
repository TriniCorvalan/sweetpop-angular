import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gummies } from './gummies';

describe('Gummies', () => {
  let component: Gummies;
  let fixture: ComponentFixture<Gummies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gummies],
    }).compileComponents();

    fixture = TestBed.createComponent(Gummies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
