import { Component, Input, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Candy, CandyCategory } from '../../core/models/candy.model';
import { BoxDraftService } from '../../core/services/box-draft.service';
import { CatalogService } from '../../core/services/catalog.service';
import { BoxDraftBar } from '../box-draft-bar/box-draft-bar';

/** @ignore */
interface ProductView {
  candy: Candy;
  statusClass: string;
  statusText: string;
  buttonLabel: string;
  disabled: boolean;
  blocked: boolean;
}

/**
 * Componente reutilizable de productos por categoría con asignación al borrador.
 * @usageNotes Usado por páginas gomitas, chocolates, caramelos y barritas.
 */
@Component({
  selector: 'app-category-products',
  imports: [RouterLink, BoxDraftBar],
  templateUrl: './category-products.html',
})
export class CategoryProducts implements OnInit {
  /** Categoría de dulces a renderizar. @usageNotes Input requerido desde la página contenedora. */
  @Input({ required: true }) category!: CandyCategory;
  /** Título visible de la página de categoría. @usageNotes Mostrado como encabezado principal. */
  @Input({ required: true }) title!: string;
  /** Ruta opcional del enlace de navegación siguiente. @usageNotes Enlace al final de la lista. */
  @Input() nextRoute?: string;
  /** Etiqueta del enlace de navegación siguiente. @usageNotes Texto visible del enlace `nextRoute`. */
  @Input() nextLabel?: string;

  protected readonly catalog = inject(CatalogService);
  private readonly boxDraftService = inject(BoxDraftService);

  candies: Candy[] = [];
  alertType: 'info' | 'success' | 'danger' | 'warning' | null = null;
  alertMessage = '';

  /**
   * Carga dulces de la categoría y muestra aviso si no hay borrador activo.
   * @returns void
   * @usageNotes Ejecutado al inicializar el componente.
   */
  ngOnInit(): void {
    this.candies = this.catalog.getCandiesByCategory(this.category);

    if (!this.boxDraftService.getBoxDraft()) {
      this.showAlert(
        'info',
        'Selecciona una caja en Cajas antes de asignar dulces.',
      );
    }
  }

  /** Vista enriquecida de productos con estado de asignación. @usageNotes Getter consumido por la plantilla. */
  get products(): ProductView[] {
    return this.candies.map((candy) => this.buildProductView(candy));
  }

  /**
   * Asigna un dulce a la pared activa del borrador.
   * @param productId Id del dulce en el catálogo.
   * @returns void
   * @usageNotes Invocado al hacer clic en el botón de asignar de cada tarjeta.
   */
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

  /**
   * Texto de descuento visible en la tarjeta del producto.
   * @param candy Dulce del catálogo.
   * @returns Etiqueta de descuento formateada.
   * @usageNotes Muestra "no disponible" si el descuento es 0.
   */
  getDiscountText(candy: Candy): string {
    return candy.discount > 0
      ? `Descuento: ${candy.discount}%`
      : 'Descuento: no disponible';
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
