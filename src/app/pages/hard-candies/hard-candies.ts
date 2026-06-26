import { Component } from '@angular/core';

import { CategoryProducts } from '../../shared/category-products/category-products';

/**
 * Página de categoría caramelos; delega en CategoryProducts.
 * @usageNotes Ruta `/caramelos`; pasa `category="caramelos"` al componente compartido.
 */
@Component({
  selector: 'app-hard-candies',
  imports: [CategoryProducts],
  templateUrl: './hard-candies.html',
})
export class HardCandies {}
