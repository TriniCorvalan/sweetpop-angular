import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Box } from '../../core/models/box.model';
import { AuthService } from '../../core/services/auth.service';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-boxes',
  imports: [RouterLink],
  templateUrl: './boxes.html',
})
export class Boxes {
  private readonly catalog = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly boxDraftService = inject(BoxDraftService);
  private readonly router = inject(Router);

  readonly boxes: Box[] = this.catalog.boxes;

  customizeBox(boxId: string): void {
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

  formatPrice(amount: number): string {
    return this.catalog.formatPrice(amount);
  }

  formatDiscount(discount: number): string {
    return this.catalog.formatDiscountPercent(discount);
  }
}
