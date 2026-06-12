import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { InventoryService } from './core/services/inventory.service';

function initializeApp(
  auth: AuthService,
  inventory: InventoryService,
  cart: CartService,
): () => void {
  return () => {
    auth.ensureAdminUser();
    inventory.ensureInventory();
    inventory.syncInventorySizesFromCatalog();
    cart.ensureCart();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, InventoryService, CartService],
      multi: true,
    },
  ],
};
