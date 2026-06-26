import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { NavLinks } from './shared/nav-links/nav-links';

/**
 * Componente raíz con layout de header, footer, navegación y contenido enrutado.
 * @usageNotes Punto de entrada visual de la aplicación Angular.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, NavLinks],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Sweetpop');
}
