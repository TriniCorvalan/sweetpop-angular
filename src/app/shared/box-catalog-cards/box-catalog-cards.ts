import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Box, BoxId } from '../../core/models/box.model';
import { AuthService } from '../../core/services/auth.service';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';

/**
 * Tarjetas del catálogo de cajas con acción de personalización.
 * @usageNotes Reutilizado en Home (`view="home"`) y Boxes (`view="catalog"`).
 */
@Component({
  selector: 'app-box-catalog-cards',
  templateUrl: './box-catalog-cards.html',
})
export class BoxCatalogCards {
  /** Modo de visualización: home o página de catálogo. @usageNotes Ajusta layout y textos de la plantilla. */
  @Input({ required: true }) view!: 'home' | 'catalog';
  /** Clase CSS opcional de la fila contenedora. @usageNotes Por defecto `mb-4`. */
  @Input() rowClass = 'mb-4';

  private readonly catalog = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly boxDraftService = inject(BoxDraftService);
  private readonly router = inject(Router);

  readonly boxes: Box[] = this.catalog.boxes;

  /**
   * Formatea precio usando CatalogService.
   * @param amount Monto numérico.
   * @returns Precio formateado en pesos chilenos.
   * @usageNotes Delegado a `CatalogService.formatPrice`.
   */
  formatPrice(amount: number): string {
    return this.catalog.formatPrice(amount);
  }

  /**
   * Formatea descuento como porcentaje visible.
   * @param discount Descuento decimal (ej. `0.15`).
   * @returns Porcentaje redondeado (ej. `15%`).
   * @usageNotes Delegado a `CatalogService.formatDiscountPercent`.
   */
  formatDiscount(discount: number): string {
    return this.catalog.formatDiscountPercent(discount);
  }

  /**
   * Inicia personalización de la caja seleccionada.
   * @param boxId Id de la caja del catálogo.
   * @returns void
   * @usageNotes Redirige a `/dulces` tras crear el borrador; pide confirmación si hay borrador previo.
   */
  customizeBox(boxId: BoxId): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/inicio-sesion']);
      return;
    }

    if (!this.auth.hasRole('user')) {
      window.alert('Solo los clientes registrados pueden personalizar cajas.');
      return;
    }

    const existing = this.boxDraftService.getBoxDraft();
    let forceReplace = false;

    if (
      existing &&
      !this.boxDraftService.isBoxDraftComplete(existing) &&
      existing.boxId !== boxId
    ) {
      forceReplace = window.confirm(
        `Ya estás personalizando una ${existing.boxName}. ¿Deseas reemplazarla?`,
      );
      if (!forceReplace) {
        return;
      }
    }

    const result = this.boxDraftService.startBoxDraft(boxId, forceReplace);
    if (!result.success) {
      window.alert(result.message);
      return;
    }

    this.router.navigate(['/dulces']);
  }
}
