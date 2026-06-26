import { Component } from '@angular/core';

import { CategoryProducts } from '../../shared/category-products/category-products';

/**
 * Página de categoría gomitas; delega en CategoryProducts.
 * @usageNotes Ruta `/gomitas`; pasa `category="gomitas"` al componente compartido.
 */
@Component({
  selector: 'app-gummies',
  imports: [CategoryProducts],
  templateUrl: './gummies.html',
})
export class Gummies {}
