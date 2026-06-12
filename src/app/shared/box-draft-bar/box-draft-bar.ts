import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BoxDraft } from '../../core/models/box-draft.model';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';

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

  get draft(): BoxDraft | null {
    return this.boxDraftService.getBoxDraft();
  }

  get filled(): number {
    return this.boxDraftService.getFilledWallsCount();
  }

  get complete(): boolean {
    return this.boxDraftService.isBoxDraftComplete();
  }

  get progressPercent(): number {
    if (!this.draft) {
      return 0;
    }
    return Math.round((this.filled / this.draft.wallsCount) * 100);
  }

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
