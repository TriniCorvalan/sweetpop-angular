import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { InventoryService } from './core/services/inventory.service';

/**
 * Factory de inicialización ejecutada al arrancar la aplicación.
 * @param auth Servicio de autenticación.
 * @param inventory Servicio de inventario.
 * @param cart Servicio de carrito.
 * @returns Función async que precarga admin, inventario (API) y carrito.
 * @usageNotes Requiere json-server (`npm run api`) para cargar el inventario.
 */
function initializeApp(
  auth: AuthService,
  inventory: InventoryService,
  cart: CartService,
): () => Promise<void> {
  return async () => {
    auth.ensureAdminUser();
    await firstValueFrom(inventory.loadInventory());
    cart.ensureCart();
  };
}

/**
 * Configuración de providers globales: router, errores e inicialización de datos.
 * @usageNotes Pasada a `bootstrapApplication` en `main.ts`.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, InventoryService, CartService],
      multi: true,
    },
  ],
};
