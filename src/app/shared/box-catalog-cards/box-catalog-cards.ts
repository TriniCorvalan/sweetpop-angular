import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Box, BoxId } from '../../core/models/box.model';
import { AuthService } from '../../core/services/auth.service';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-box-catalog-cards',
  templateUrl: './box-catalog-cards.html',
})
export class BoxCatalogCards {
  @Input({ required: true }) view!: 'home' | 'catalog';
  @Input() rowClass = 'mb-4';

  private readonly catalog = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly boxDraftService = inject(BoxDraftService);
  private readonly router = inject(Router);

  readonly boxes: Box[] = this.catalog.boxes;

  formatPrice(amount: number): string {
    return this.catalog.formatPrice(amount);
  }

  formatDiscount(discount: number): string {
    return this.catalog.formatDiscountPercent(discount);
  }

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
