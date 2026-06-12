import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bars } from './bars';

describe('Bars', () => {
  let component: Bars;
  let fixture: ComponentFixture<Bars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bars],
    }).compileComponents();

    fixture = TestBed.createComponent(Bars);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
