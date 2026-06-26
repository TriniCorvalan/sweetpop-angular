import { BoxId } from '../models/box.model';
import { CandySize } from '../models/candy.model';

/** Claves usadas para persistir datos en localStorage y sessionStorage. @usageNotes Referenciadas por servicios de auth, carrito, inventario y borrador. */
export const STORAGE_KEYS = {
  users: 'sweetpop_users',
  session: 'sweetpop_session',
  inventory: 'sweetpop_inventory',
  cart: 'sweetpop_cart',
  boxDraft: 'sweetpop_box_draft',
} as const;

/** Stock inicial asignado a cada dulce al crear el inventario. @usageNotes Usado por `InventoryService.ensureInventory`. */
export const INITIAL_STOCK = 20;

/** Mapa de cajas compatibles según el tamaño del dulce. @usageNotes Consultado por `CatalogService.isCandyCompatibleWithBox`. */
export const SIZE_COMPATIBILITY: Record<CandySize, BoxId[]> = {
  small: ['box-simple', 'box-double', 'box-triple'],
  medium: ['box-simple', 'box-double', 'box-triple'],
  large: ['box-double', 'box-triple'],
};

/** Unidades de dulce requeridas por pared según tamaño del producto. @usageNotes Consultado por `CatalogService.getWallQuantityBySize`. */
export const WALL_QUANTITY_BY_SIZE: Record<CandySize, number> = {
  small: 10,
  medium: 7,
  large: 4,
};

/** Etiquetas legibles en español por categoría interna. @usageNotes Consultado por `CatalogService.getCategoryLabel`. */
export const CATEGORY_LABELS = {
  gomitas: 'Gomitas',
  chocolate: 'Chocolate',
  caramelos: 'Caramelos',
  barritas: 'Barritas',
} as const;
