import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoxCatalogCards } from '../../shared/box-catalog-cards/box-catalog-cards';
import { CategoryCatalogCards } from '../../shared/category-catalog-cards/category-catalog-cards';

/**
 * Página de inicio con catálogos destacados de cajas y categorías.
 * @usageNotes Ruta raíz `/`; punto de entrada del sitio.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, BoxCatalogCards, CategoryCatalogCards],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
