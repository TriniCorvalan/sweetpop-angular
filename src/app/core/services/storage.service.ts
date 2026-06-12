import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
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

  writeJson(storage: Storage, key: string, value: unknown): void {
    storage.setItem(key, JSON.stringify(value));
  }

  removeItem(storage: Storage, key: string): void {
    storage.removeItem(key);
  }

  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
