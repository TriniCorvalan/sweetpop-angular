import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoxCatalogCards } from '../../shared/box-catalog-cards/box-catalog-cards';

/**
 * Catálogo de cajas disponibles para personalizar.
 * @usageNotes Ruta `/cajas`; incluye `BoxCatalogCards` en modo catálogo.
 */
@Component({
  selector: 'app-boxes',
  imports: [RouterLink, BoxCatalogCards],
  templateUrl: './boxes.html',
})
export class Boxes {}
