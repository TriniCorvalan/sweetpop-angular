import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HardCandies } from './hard-candies';

describe('HardCandies', () => {
  let component: HardCandies;
  let fixture: ComponentFixture<HardCandies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HardCandies],
    }).compileComponents();

    fixture = TestBed.createComponent(HardCandies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
