import { TestBed } from '@angular/core/testing';

import { clearStorages } from '../../testing/test-helpers';
import { Candies } from './candies';

describe('Candies', () => {
  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Candies],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Candies);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza el hub de dulces con borrador y categorias', () => {
    const fixture = TestBed.createComponent(Candies);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Catálogo de dulces');
    expect(element.querySelector('app-box-draft-bar')).toBeTruthy();
    expect(element.querySelector('app-category-catalog-cards')).toBeTruthy();
    expect(element.textContent).toContain('4 categorías de dulces');
  });
});
