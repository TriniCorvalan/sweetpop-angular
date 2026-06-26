import { Component } from '@angular/core';

import { CategoryProducts } from '../../shared/category-products/category-products';

/**
 * Página de categoría barritas; delega en CategoryProducts.
 * @usageNotes Ruta `/barritas`; pasa `category="barritas"` al componente compartido.
 */
@Component({
  selector: 'app-bars',
  imports: [CategoryProducts],
  templateUrl: './bars.html',
})
export class Bars {}
