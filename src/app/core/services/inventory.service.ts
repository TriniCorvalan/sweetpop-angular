import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { INVENTORY_API_URL } from '../constants/api.constants';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { InventoryItem, InventoryItemUpdate } from '../models/inventory-item.model';
import { StorageService } from './storage.service';

/**
 * Servicio de inventario: CRUD en json-server y lecturas síncronas desde localStorage.
 * @usageNotes El modelo usa `id` numérico igual que la API; tras cada mutación se sincroniza el espejo local.
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private connectionError = false;

  /**
   * Indica si la última carga o mutación falló por no poder contactar a json-server.
   * @returns `true` si hay un error de conexión pendiente de mostrar.
   */
  hasConnectionError(): boolean {
    return this.connectionError;
  }

  /**
   * Carga el inventario desde la API y lo guarda en localStorage.
   * @returns Observable con `true` si la carga fue exitosa, `false` si falló la conexión/API.
   * @usageNotes Ejecutado en el `APP_INITIALIZER` y al entrar a vistas de inventario.
   *   No propaga el error para que la app pueda arrancar sin json-server.
   */
  loadInventory(): Observable<boolean> {
    return this.http.get<InventoryItem[]>(INVENTORY_API_URL).pipe(
      tap((items) => {
        this.saveLocal(items);
        this.connectionError = false;
      }),
      map(() => true),
      catchError(() => {
        this.connectionError = true;
        return of(false);
      }),
    );
  }

  /**
   * Marca el estado de conexión tras una mutación HTTP.
   * @param available `true` si la API respondió; `false` si hubo fallo de conexión.
   * @returns void
   */
  setConnectionAvailable(available: boolean): void {
    this.connectionError = !available;
  }

  /**
   * Reemplaza el inventario local (útil en pruebas unitarias).
   * @param items Ítems a persistir en localStorage.
   * @returns void
   */
  setLocalInventory(items: InventoryItem[]): void {
    this.saveLocal(items.map((item) => ({ ...item })));
  }

  /**
   * Obtiene el inventario desde localStorage.
   * @returns Lista de ítems.
   */
  getInventory(): InventoryItem[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.inventory, []);
  }

  /**
   * Busca un ítem de inventario por id.
   * @param id Id numérico del producto.
   * @returns Ítem encontrado o `undefined`.
   */
  getInventoryItem(id: number): InventoryItem | undefined {
    return this.getInventory().find((entry) => entry.id === id);
  }

  /**
   * Retorna las unidades disponibles de un dulce.
   * @param id Id numérico del producto.
   * @returns Stock disponible; `0` si no existe en inventario.
   */
  getStock(id: number): number {
    const item = this.getInventoryItem(id);
    return item ? item.stock : 0;
  }

  /**
   * Actualiza el stock de un dulce (mínimo 0).
   * @param id Id numérico del producto.
   * @param newStock Nuevo stock a persistir.
   * @returns Observable con `false` si el producto no existe.
   */
  updateStock(id: number, newStock: number): Observable<boolean> {
    const item = this.getInventoryItem(id);
    if (!item) {
      return of(false);
    }

    return this.updateItem(id, {
      ...this.toUpdatePayload(item),
      stock: Math.max(0, newStock),
    });
  }

  /**
   * Actualiza los datos editables de un producto del inventario.
   * @param id Id numérico del producto.
   * @param updates Campos a persistir.
   * @returns Observable con `false` si el producto no existe localmente.
   */
  updateItem(id: number, updates: InventoryItemUpdate): Observable<boolean> {
    if (!this.getInventoryItem(id)) {
      return of(false);
    }

    const item = this.buildItem(id, updates);
    this.replaceLocalItem(item);

    return this.http.put<InventoryItem>(`${INVENTORY_API_URL}/${id}`, item).pipe(
      tap((saved) => {
        this.replaceLocalItem(saved);
        this.connectionError = false;
      }),
      map(() => true),
    );
  }

  /**
   * Agrega un producto nuevo al inventario.
   * @param data Datos del producto (sin `id`; lo asigna json-server).
   * @returns Observable con el ítem creado, o `null` si el nombre queda vacío.
   */
  createItem(data: InventoryItemUpdate): Observable<InventoryItem | null> {
    const name = data.name.trim();
    if (!name) {
      return of(null);
    }

    const payload = this.buildPayload({ ...data, name });

    return this.http.post<InventoryItem>(INVENTORY_API_URL, payload).pipe(
      tap((created) => {
        this.saveLocal([...this.getInventory(), created]);
        this.connectionError = false;
      }),
    );
  }

  /**
   * Elimina un producto del inventario.
   * @param id Id numérico del producto a eliminar.
   * @returns Observable con `false` si el producto no existe localmente.
   */
  deleteItem(id: number): Observable<boolean> {
    const inventory = this.getInventory();
    if (!inventory.some((item) => item.id === id)) {
      return of(false);
    }

    this.saveLocal(inventory.filter((item) => item.id !== id));

    return this.http.delete<void>(`${INVENTORY_API_URL}/${id}`).pipe(
      tap(() => {
        this.connectionError = false;
      }),
      map(() => true),
    );
  }

  private saveLocal(inventory: InventoryItem[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.inventory, inventory);
  }

  private replaceLocalItem(item: InventoryItem): void {
    const inventory = this.getInventory();
    const index = inventory.findIndex((entry) => entry.id === item.id);

    if (index === -1) {
      this.saveLocal([...inventory, item]);
      return;
    }

    inventory[index] = item;
    this.saveLocal(inventory);
  }

  private buildItem(id: number, data: InventoryItemUpdate): InventoryItem {
    return { id, ...this.buildPayload(data) };
  }

  private buildPayload(data: InventoryItemUpdate): InventoryItemUpdate {
    return {
      name: data.name.trim(),
      category: data.category,
      size: data.size,
      price: Math.max(0, data.price),
      image: data.image.trim(),
      description: data.description.trim(),
      discount: Math.max(0, Number(data.discount) || 0),
      stock: Math.max(0, data.stock),
    };
  }

  private toUpdatePayload(item: InventoryItem): InventoryItemUpdate {
    const { id: _id, ...rest } = item;
    return rest;
  }
}
