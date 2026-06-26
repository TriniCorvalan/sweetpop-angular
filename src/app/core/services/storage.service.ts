import { Injectable } from '@angular/core';

/**
 * Servicio de bajo nivel para interactuar con Storage del navegador.
 * @usageNotes Wrapper sobre `localStorage` y `sessionStorage` con parseo JSON seguro.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Lee y parsea un valor JSON desde un Storage.
   * @param storage Instancia de `localStorage` o `sessionStorage`.
   * @param key Clave a leer.
   * @param fallback Valor por defecto si la clave no existe o el JSON es inválido.
   * @returns Valor parseado o `fallback`.
   * @usageNotes Usado por todos los servicios de persistencia.
   */
  readJson<T>(storage: Storage, key: string, fallback: T): T {
    try {
      const raw = storage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Serializa y guarda un valor como JSON en un Storage.
   * @param storage Instancia de `localStorage` o `sessionStorage`.
   * @param key Clave donde persistir.
   * @param value Valor a serializar.
   * @returns void
   * @usageNotes Sobrescribe el valor previo de la clave.
   */
  writeJson(storage: Storage, key: string, value: unknown): void {
    storage.setItem(key, JSON.stringify(value));
  }

  /**
   * Elimina una clave del Storage indicado.
   * @param storage Instancia de `localStorage` o `sessionStorage`.
   * @param key Clave a eliminar.
   * @returns void
   * @usageNotes Usado al cerrar sesión o limpiar borrador de caja.
   */
  removeItem(storage: Storage, key: string): void {
    storage.removeItem(key);
  }

  /**
   * Genera un identificador único con prefijo.
   * @param prefix Prefijo del id (ej. `user`, `cart`).
   * @returns Id único en formato `{prefix}-{timestamp}-{random}`.
   * @usageNotes Usado al registrar usuarios y agregar ítems al carrito.
   */
  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
