import { Component, Input, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Candy, CandyCategory } from '../../core/models/candy.model';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';
import { BoxDraftBar } from '../box-draft-bar/box-draft-bar';

interface ProductView {
  candy: Candy;
  statusClass: string;
  statusText: string;
  buttonLabel: string;
  disabled: boolean;
  blocked: boolean;
}

@Component({
  selector: 'app-category-products',
  imports: [RouterLink, BoxDraftBar],
  templateUrl: './category-products.html',
})
export class CategoryProducts implements OnInit {
  @Input({ required: true }) category!: CandyCategory;
  @Input({ required: true }) title!: string;
  @Input() nextRoute?: string;
  @Input() nextLabel?: string;

  protected readonly catalog = inject(CatalogService);
  private readonly boxDraftService = inject(BoxDraftService);

  candies: Candy[] = [];
  alertType: 'info' | 'success' | 'danger' | 'warning' | null = null;
  alertMessage = '';

  ngOnInit(): void {
    this.candies = this.catalog.getCandiesByCategory(this.category);

    if (!this.boxDraftService.getBoxDraft()) {
      this.showAlert(
        'info',
        'Selecciona una caja en Cajas antes de asignar dulces.',
      );
    }
  }

  get products(): ProductView[] {
    return this.candies.map((candy) => this.buildProductView(candy));
  }

  assignProduct(productId: string): void {
    const result = this.boxDraftService.assignCandyToWall(productId);

    if (!result.success) {
      this.showAlert(result.redirect ? 'warning' : 'danger', result.message);
      return;
    }

    this.showAlert('success', result.message);

    if (result.complete) {
      this.showAlert(
        'success',
        `${result.message} Ya puedes agregar la caja al carrito.`,
      );
    }
  }

  getDiscountText(candy: Candy): string {
    return candy.discountLabel === 'no disponible'
      ? 'Descuento: no disponible'
      : `Descuento: ${candy.discountLabel}`;
  }

  private buildProductView(candy: Candy): ProductView {
    const draft = this.boxDraftService.getBoxDraft();
    const available = this.boxDraftService.getAvailableStockForDraft(candy.id);
    const unitsPerWall = this.catalog.getWallQuantityBySize(candy.size);

    if (!draft) {
      return {
        candy,
        statusClass: '',
        statusText: '',
        buttonLabel: 'Elegir caja primero',
        disabled: true,
        blocked: false,
      };
    }

    const compatible = this.catalog.isCandyCompatibleWithBox(candy.size, draft.boxId);
    const complete = this.boxDraftService.isBoxDraftComplete();
    const nextWall = this.boxDraftService.getNextEmptyWall();
    const nextLabel = nextWall ? nextWall.wallIndex : draft.wallsCount;

    let statusClass = 'catalog-status-ok';
    let statusText = `Tamaño ${this.catalog.getSizeLabel(candy.size)} · ${unitsPerWall} u. por pared`;

    if (!compatible) {
      statusClass = 'catalog-status-blocked';
      statusText = `No cabe en ${draft.boxName} (tamaño ${this.catalog.getSizeLabel(candy.size)})`;
    } else if (available < unitsPerWall) {
      statusClass = 'catalog-status-blocked';
      statusText = 'No disponible en este momento';
    } else if (complete) {
      statusClass = 'catalog-status-info';
      statusText = 'Caja completa. Agrega al carrito arriba.';
    }

    const disabled = !compatible || available < unitsPerWall || complete;
    const blocked = !compatible || available < unitsPerWall;
    const buttonLabel = complete
      ? 'Caja completa'
      : `Asignar a pared ${nextLabel} (${unitsPerWall} u.)`;

    return {
      candy,
      statusClass,
      statusText,
      buttonLabel,
      disabled,
      blocked,
    };
  }

  private showAlert(type: 'info' | 'success' | 'danger' | 'warning', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
