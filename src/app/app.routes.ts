import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { Bars } from './pages/bars/bars';
import { Boxes } from './pages/boxes/boxes';
import { Candies } from './pages/candies/candies';
import { Cart } from './pages/cart/cart';
import { Chocolates } from './pages/chocolates/chocolates';
import { Customers } from './pages/customers/customers';
import { Gummies } from './pages/gummies/gummies';
import { HardCandies } from './pages/hard-candies/hard-candies';
import { Home } from './pages/home/home';
import { Inventory } from './pages/inventory/inventory';
import { InventoryForm } from './pages/inventory/inventory-form/inventory-form';
import { Login } from './pages/login/login';
import { Logout } from './pages/logout/logout';
import { Profile } from './pages/profile/profile';
import { RecoverPassword } from './pages/recover-password/recover-password';
import { Register } from './pages/register/register';

/** Tabla de rutas de la aplicación con guards por rol. @usageNotes Consumida por `provideRouter` en `app.config`. */
export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'inicio-sesion',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'registro',
    component: Register,
    canActivate: [guestGuard],
  },
  {
    path: 'recuperar-contrasena',
    component: RecoverPassword,
    canActivate: [guestGuard],
  },
  { path: 'cerrar-sesion', component: Logout },
  { path: 'cajas', component: Boxes },
  { path: 'dulces', component: Candies },
  { path: 'barritas', component: Bars },
  { path: 'caramelos', component: HardCandies },
  { path: 'chocolates', component: Chocolates },
  { path: 'gomitas', component: Gummies },
  {
    path: 'clientes',
    component: Customers,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'carrito',
    component: Cart,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'perfil',
    component: Profile,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'inventario',
    component: Inventory,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'inventario/nuevo',
    component: InventoryForm,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'inventario/:id',
    component: InventoryForm,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  { path: '**', redirectTo: '' },
];
