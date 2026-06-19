import { TestBed } from '@angular/core/testing';

import { clearStorages } from '../../testing/test-helpers';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    clearStorages();
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza el hero y los catalogos principales', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Cajas anidadas de dulces');
    expect(element.querySelector('app-box-catalog-cards')).toBeTruthy();
    expect(element.querySelector('app-category-catalog-cards')).toBeTruthy();
    expect(element.textContent).toContain('Catálogo de cajas');
    expect(element.textContent).toContain('Categorías de dulces');
  });
});
