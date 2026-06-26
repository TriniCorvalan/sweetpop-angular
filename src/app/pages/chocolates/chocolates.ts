import { Component } from '@angular/core';

import { CategoryProducts } from '../../shared/category-products/category-products';

/**
 * Página de categoría chocolate; delega en CategoryProducts.
 * @usageNotes Ruta `/chocolates`; pasa `category="chocolate"` al componente compartido.
 */
@Component({
  selector: 'app-chocolates',
  imports: [CategoryProducts],
  templateUrl: './chocolates.html',
})
export class Chocolates {}
