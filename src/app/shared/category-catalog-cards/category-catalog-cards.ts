import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CandyCategory } from '../../core/models/candy.model';
import { Category } from '../../core/models/category.model';
import { CatalogService } from '../../core/services/catalog.service';

/**
 * Tarjetas de categorías de dulces con enlaces a cada ruta.
 * @usageNotes Reutilizado en Home y en la página índice de dulces.
 */
@Component({
  selector: 'app-category-catalog-cards',
  imports: [RouterLink],
  templateUrl: './category-catalog-cards.html',
})
export class CategoryCatalogCards {
  /** Clase CSS opcional de la fila contenedora. @usageNotes Por defecto `mb-4`. */
  @Input() rowClass = 'mb-4';

  protected readonly catalog = inject(CatalogService);

  readonly categories: Category[] = this.catalog.categories;

  /**
   * Obtiene etiqueta legible de una categoría.
   * @param category Id interno de categoría.
   * @returns Nombre en español de la categoría.
   * @usageNotes Delegado a `CatalogService.getCategoryLabel`.
   */
  getCategoryLabel(category: CandyCategory): string {
    return this.catalog.getCategoryLabel(category);
  }
}
