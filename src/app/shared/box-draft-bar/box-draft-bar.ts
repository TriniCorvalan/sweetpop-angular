import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BoxDraft } from '../../core/models/box-draft.model';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';

/**
 * Barra de progreso del borrador de caja personalizada.
 * @usageNotes Mostrada en páginas de dulces y categorías mientras hay borrador activo.
 */
@Component({
  selector: 'app-box-draft-bar',
  imports: [RouterLink],
  templateUrl: './box-draft-bar.html',
})
export class BoxDraftBar {
  private readonly boxDraftService = inject(BoxDraftService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  feedbackMessage = '';
  feedbackType: 'success' | 'danger' = 'success';

  /** Borrador activo desde sessionStorage. @usageNotes `null` si no hay personalización en curso. */
  get draft(): BoxDraft | null {
    return this.boxDraftService.getBoxDraft();
  }

  /** Paredes completadas del borrador. @usageNotes Usado para calcular progreso. */
  get filled(): number {
    return this.boxDraftService.getFilledWallsCount();
  }

  /** Indica si el borrador está listo para agregar al carrito. @usageNotes Habilita el botón de confirmación. */
  get complete(): boolean {
    return this.boxDraftService.isBoxDraftComplete();
  }

  /** Porcentaje de progreso del borrador (0–100). @usageNotes Mostrado en la barra visual. */
  get progressPercent(): number {
    if (!this.draft) {
      return 0;
    }
    return Math.round((this.filled / this.draft.wallsCount) * 100);
  }

  /** Resumen de paredes asignadas con totales por línea. @usageNotes Lista en la barra de borrador. */
  get assignedWalls(): { label: string }[] {
    if (!this.draft) {
      return [];
    }

    return this.draft.walls
      .filter((wall) => wall.productId)
      .map((wall) => {
        const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
        const lineTotal = wall.price! * quantity;
        return {
          label: `Pared ${wall.wallIndex}: ${wall.productName} × ${quantity} (${this.catalog.formatPrice(lineTotal)})`,
        };
      });
  }

  /**
   * Agrega la caja completada al carrito y redirige.
   * @returns void
   * @usageNotes Invocado desde el botón "Agregar al carrito" de la barra.
   */
  addToCart(): void {
    const result = this.boxDraftService.addCompletedBoxToCart();

    if (!result.success) {
      this.feedbackType = 'danger';
      this.feedbackMessage = result.message;
      return;
    }

    this.feedbackType = 'success';
    this.feedbackMessage = `${result.message} Redirigiendo...`;

    setTimeout(() => {
      this.router.navigateByUrl(result.redirect ?? '/carrito');
    }, 800);
  }
}
