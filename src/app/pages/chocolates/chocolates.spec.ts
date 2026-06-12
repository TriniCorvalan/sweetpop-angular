import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chocolates } from './chocolates';

describe('Chocolates', () => {
  let component: Chocolates;
  let fixture: ComponentFixture<Chocolates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chocolates],
    }).compileComponents();

    fixture = TestBed.createComponent(Chocolates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
