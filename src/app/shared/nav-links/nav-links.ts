import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
/**
 * Enlaces de navegación auxiliares del layout principal.
 * @usageNotes Renderizado en el layout raíz (`App`).
 */
@Component({
  selector: 'app-nav-links',
  imports: [RouterLink],
  templateUrl: './nav-links.html',
  styleUrl: './nav-links.css',
})
export class NavLinks {}
