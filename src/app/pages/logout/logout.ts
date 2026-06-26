import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

/**
 * Página de cierre de sesión: limpia sesión y redirige al inicio.
 * @usageNotes Ruta `/cerrar-sesion`; ejecuta logout al cargar.
 */
@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Cierra la sesión activa y redirige al inicio.
   * @returns void
   * @usageNotes Ejecutado automáticamente al entrar a la ruta.
   */
  ngOnInit(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
