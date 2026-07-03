import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { BoxDraft, BoxWallAssignment } from '../models/box-draft.model';
import { ServiceResult } from '../models/service-result.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { StorageService } from './storage.service';

/**
 * Servicio de personalización de cajas mediante borrador por paredes.
 * @usageNotes Persiste el borrador en `sessionStorage` (`STORAGE_KEYS.boxDraft`).
 */
@Injectable({
  providedIn: 'root',
})
export class BoxDraftService {
  constructor(
    private readonly storage: StorageService,
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
    private readonly auth: AuthService,
    private readonly cart: CartService,
  ) {}

  /**
   * Obtiene el borrador activo desde sessionStorage.
   * @returns Borrador actual o `null` si no hay personalización en curso.
   * @usageNotes Consumido por Header y páginas de categoría/cajas.
   */
  getBoxDraft(): BoxDraft | null {
    return this.storage.readJson(sessionStorage, STORAGE_KEYS.boxDraft, null);
  }

  /**
   * Persiste el borrador en sessionStorage.
   * @param draft Borrador completo a guardar.
   * @returns void
   * @usageNotes Sobrescribe el borrador anterior.
   */
  saveBoxDraft(draft: BoxDraft): void {
    this.storage.writeJson(sessionStorage, STORAGE_KEYS.boxDraft, draft);
  }

  /**
   * Elimina el borrador de sessionStorage.
   * @returns void
   * @usageNotes Tras agregar la caja al carrito o cancelar personalización.
   */
  clearBoxDraft(): void {
    this.storage.removeItem(sessionStorage, STORAGE_KEYS.boxDraft);
  }

  /**
   * Cuenta paredes con dulce asignado.
   * @param draft Borrador a evaluar; usa el activo si se omite.
   * @returns Cantidad de paredes completadas.
   * @usageNotes Mostrado en el indicador de progreso del Header.
   */
  getFilledWallsCount(draft: BoxDraft | null = this.getBoxDraft()): number {
    if (!draft) {
      return 0;
    }
    return draft.walls.filter((wall) => wall.productId).length;
  }

  /**
   * Indica si todas las paredes del borrador están completas.
   * @param draft Borrador a evaluar; usa el activo si se omite.
   * @returns `true` si todas las paredes tienen dulce.
   * @usageNotes Habilita el botón agregar al carrito.
   */
  isBoxDraftComplete(draft: BoxDraft | null = this.getBoxDraft()): boolean {
    if (!draft) {
      return false;
    }
    return this.getFilledWallsCount(draft) === draft.wallsCount;
  }

  /**
   * Retorna la primera pared sin dulce asignado.
   * @param draft Borrador a evaluar; usa el activo si se omite.
   * @returns Pared vacía o `null` si no hay borrador o está completo.
   * @usageNotes Usado por `assignCandyToWall`.
   */
  getNextEmptyWall(draft: BoxDraft | null = this.getBoxDraft()): BoxWallAssignment | null {
    if (!draft) {
      return null;
    }
    return draft.walls.find((wall) => !wall.productId) ?? null;
  }

  /**
   * Suma unidades de un dulce ya reservadas en el borrador.
   * @param productId Id del dulce.
   * @param draft Borrador a evaluar; usa el activo si se omite.
   * @returns Unidades reservadas en paredes del borrador.
   * @usageNotes Resta del stock visible al asignar más unidades del mismo dulce.
   */
  getQuantityUsedInDraft(productId: string, draft: BoxDraft | null = this.getBoxDraft()): number {
    if (!draft) {
      return 0;
    }

    return draft.walls
      .filter((wall) => wall.productId === productId)
      .reduce((sum, wall) => {
        const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
        return sum + quantity;
      }, 0);
  }

  /**
   * Stock disponible para asignar considerando reservas del borrador.
   * @param productId Id del dulce.
   * @returns Unidades disponibles para la siguiente pared.
   * @usageNotes Mostrado en tarjetas de producto durante personalización.
   */
  getAvailableStockForDraft(productId: string): number {
    return this.inventory.getStock(productId) - this.getQuantityUsedInDraft(productId);
  }

  /**
   * Inicia o reinicia el borrador con la caja seleccionada.
   * @param boxId Id de la caja del catálogo.
   * @param forceReplace Si `true`, reemplaza un borrador incompleto de otra caja.
   * @returns Resultado con mensaje, redirección o confirmación según el caso.
   * @usageNotes Invocado desde la página Boxes al elegir una caja.
   */
  startBoxDraft(boxId: string, forceReplace = false): Observable<ServiceResult> {
    if (!this.auth.hasRole('user')) {
      return of({
        success: false,
        message: 'Debes iniciar sesión como cliente para personalizar una caja.',
        redirect: '/inicio-sesion',
      });
    }

    return this.catalog.getBoxById(boxId).pipe(
      map((box) => {
        if (!box) {
          return { success: false, message: 'La caja seleccionada no existe.' };
        }

        const existing = this.getBoxDraft();
        if (
          existing &&
          !this.isBoxDraftComplete(existing) &&
          existing.boxId !== box.id &&
          !forceReplace
        ) {
          return {
            success: false,
            needsConfirm: true,
            message: `Ya estás personalizando una ${existing.boxName}. ¿Deseas reemplazarla por ${box.name}?`,
            boxId: box.id,
          };
        }

        const walls: BoxWallAssignment[] = [];
        for (let index = 1; index <= box.wallsCount; index += 1) {
          walls.push({
            wallIndex: index,
            productId: null,
            productName: null,
            price: null,
            size: null,
            quantity: null,
          });
        }

        this.saveBoxDraft({
          boxId: box.id,
          boxName: box.name,
          wallsCount: box.wallsCount,
          boxPrice: box.boxPrice,
          discount: box.discount,
          walls,
        });

        return {
          success: true,
          message: `${box.name} seleccionada. Asigna un dulce por pared.`,
        };
      }),
    );
  }

  /**
   * Asigna un dulce a la siguiente pared libre del borrador.
   * @param productId Id del dulce a asignar.
   * @returns Resultado con progreso (`filled`, `complete`) o mensaje de error.
   * @usageNotes Invocado desde CategoryProducts al hacer clic en un dulce.
   */
  assignCandyToWall(productId: string): ServiceResult {
    if (!this.auth.hasRole('user')) {
      return {
        success: false,
        message: 'Debes iniciar sesión como cliente.',
        redirect: '/inicio-sesion',
      };
    }

    const draft = this.getBoxDraft();
    if (!draft) {
      return {
        success: false,
        message: 'Primero elige una caja en el catálogo de cajas.',
        redirect: '/cajas',
      };
    }

    if (this.isBoxDraftComplete(draft)) {
      return {
        success: false,
        message:
          'Todas las paredes ya tienen dulce. Agrega la caja al carrito o elige otra caja.',
      };
    }

    const candy = this.catalog.getCandyById(productId);
    if (!candy) {
      return { success: false, message: 'El dulce seleccionado no existe.' };
    }

    if (!this.catalog.isCandyCompatibleWithBox(candy.size, draft.boxId)) {
      return {
        success: false,
        message: `${candy.name} (tamaño ${this.catalog.getSizeLabel(candy.size)}) no cabe en ${draft.boxName}.`,
      };
    }

    const requiredQuantity = this.catalog.getWallQuantityBySize(candy.size);

    if (this.getAvailableStockForDraft(productId) < requiredQuantity) {
      return {
        success: false,
        message: `${candy.name} no está disponible en este momento.`,
      };
    }

    const nextWall = this.getNextEmptyWall(draft);
    if (!nextWall) {
      return { success: false, message: 'No hay paredes disponibles en el borrador.' };
    }

    nextWall.productId = candy.id;
    nextWall.productName = candy.name;
    nextWall.price = candy.price;
    nextWall.size = candy.size;
    nextWall.quantity = requiredQuantity;

    this.saveBoxDraft(draft);

    const filled = this.getFilledWallsCount(draft);
    return {
      success: true,
      message: `${candy.name} asignado a la pared ${nextWall.wallIndex} (${requiredQuantity} unidades).`,
      filled,
      complete: this.isBoxDraftComplete(draft),
    };
  }

  /**
   * Valida el borrador completo, calcula totales y agrega la caja al carrito.
   * @returns Resultado con redirección a `/carrito` si tiene éxito.
   * @usageNotes Invocado desde Header o CategoryProducts al confirmar la caja.
   */
  addCompletedBoxToCart(): ServiceResult {
    if (!this.auth.hasRole('user')) {
      return {
        success: false,
        message: 'Debes iniciar sesión como cliente.',
        redirect: '/inicio-sesion',
      };
    }

    const draft = this.getBoxDraft();
    if (!draft) {
      return {
        success: false,
        message: 'No hay una caja en personalización.',
        redirect: '/cajas',
      };
    }

    if (!this.isBoxDraftComplete(draft)) {
      return {
        success: false,
        message: `Completa las ${draft.wallsCount} paredes antes de agregar al carrito.`,
      };
    }

    const stockNeeded: Record<string, number> = {};
    draft.walls.forEach((wall) => {
      const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
      stockNeeded[wall.productId!] = (stockNeeded[wall.productId!] ?? 0) + quantity;
    });

    for (const [productId, quantity] of Object.entries(stockNeeded)) {
      if (this.inventory.getStock(productId) < quantity) {
        const candy = this.catalog.getCandyById(productId);
        return {
          success: false,
          message: `${candy ? candy.name : 'Un dulce'} no está disponible en la cantidad necesaria.`,
        };
      }
    }

    const candiesSubtotal = draft.walls.reduce((sum, wall) => {
      const quantity = wall.quantity ?? this.catalog.getWallQuantityBySize(wall.size!);
      return sum + wall.price! * quantity;
    }, 0);
    const total = Math.round((draft.boxPrice + candiesSubtotal) * (1 - draft.discount));

    const cart = this.cart.getCart();
    cart.push({
      cartItemId: this.storage.generateId('cart'),
      boxId: draft.boxId,
      boxName: draft.boxName,
      boxPrice: draft.boxPrice,
      discount: draft.discount,
      walls: draft.walls.map((wall) => ({ ...wall })),
      candiesSubtotal,
      total,
    });

    this.cart.saveCart(cart);
    this.clearBoxDraft();

    return {
      success: true,
      message: `${draft.boxName} agregada al carrito.`,
      redirect: '/carrito',
    };
  }
}
