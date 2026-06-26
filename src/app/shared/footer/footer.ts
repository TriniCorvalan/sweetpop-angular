import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
/**
 * Pie de página con información de contacto e institucional.
 * @usageNotes Renderizado en el layout raíz (`App`).
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
