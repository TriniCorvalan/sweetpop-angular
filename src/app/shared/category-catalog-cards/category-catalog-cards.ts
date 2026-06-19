import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CandyCategory } from '../../core/models/candy.model';
import { Category } from '../../core/models/category.model';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-category-catalog-cards',
  imports: [RouterLink],
  templateUrl: './category-catalog-cards.html',
})
export class CategoryCatalogCards {
  @Input() rowClass = 'mb-4';

  protected readonly catalog = inject(CatalogService);

  readonly categories: Category[] = this.catalog.categories;

  getCategoryLabel(category: CandyCategory): string {
    return this.catalog.getCategoryLabel(category);
  }
}
