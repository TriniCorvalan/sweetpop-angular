import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoxDraftBar } from '../../shared/box-draft-bar/box-draft-bar';
import { CategoryCatalogCards } from '../../shared/category-catalog-cards/category-catalog-cards';

/**
 * Índice de categorías de dulces con barra de borrador activo.
 * @usageNotes Ruta `/dulces`; enlace central hacia cada categoría.
 */
@Component({
  selector: 'app-candies',
  imports: [RouterLink, BoxDraftBar, CategoryCatalogCards],
  templateUrl: './candies.html',
})
export class Candies {}
