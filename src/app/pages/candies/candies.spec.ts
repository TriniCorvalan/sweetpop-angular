import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Candies } from './candies';

describe('Candies', () => {
  let component: Candies;
  let fixture: ComponentFixture<Candies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Candies],
    }).compileComponents();

    fixture = TestBed.createComponent(Candies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
