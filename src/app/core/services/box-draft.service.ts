import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { BoxDraft, BoxWallAssignment } from '../models/box-draft.model';
import { ServiceResult } from '../models/service-result.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { StorageService } from './storage.service';

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

  getBoxDraft(): BoxDraft | null {
    return this.storage.readJson(sessionStorage, STORAGE_KEYS.boxDraft, null);
  }

  saveBoxDraft(draft: BoxDraft): void {
    this.storage.writeJson(sessionStorage, STORAGE_KEYS.boxDraft, draft);
  }

  clearBoxDraft(): void {
    this.storage.removeItem(sessionStorage, STORAGE_KEYS.boxDraft);
  }

  getFilledWallsCount(draft: BoxDraft | null = this.getBoxDraft()): number {
    if (!draft) {
      return 0;
    }
    return draft.walls.filter((wall) => wall.productId).length;
  }

  isBoxDraftComplete(draft: BoxDraft | null = this.getBoxDraft()): boolean {
    if (!draft) {
      return false;
    }
    return this.getFilledWallsCount(draft) === draft.wallsCount;
  }

  getNextEmptyWall(draft: BoxDraft | null = this.getBoxDraft()): BoxWallAssignment | null {
    if (!draft) {
      return null;
    }
    return draft.walls.find((wall) => !wall.productId) ?? null;
  }

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

  getAvailableStockForDraft(productId: string): number {
    return this.inventory.getStock(productId) - this.getQuantityUsedInDraft(productId);
  }

  startBoxDraft(boxId: string, forceReplace = false): ServiceResult {
    if (!this.auth.hasRole('user')) {
      return {
        success: false,
        message: 'Debes iniciar sesión como cliente para personalizar una caja.',
        redirect: '/inicio-sesion',
      };
    }

    const box = this.catalog.getBoxById(boxId);
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
  }

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
