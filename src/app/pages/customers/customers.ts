import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Página de clientes (admin): lista usuarios registrados con rol user.
 * @usageNotes Ruta `/clientes`; requiere rol `admin` vía `authGuard`.
 */
@Component({
  selector: 'app-customers',
  imports: [RouterLink],
  templateUrl: './customers.html',
})
export class Customers {
  private readonly auth = inject(AuthService);

  /** Lista de clientes registrados. @usageNotes Getter consumido por la tabla de la plantilla. */
  get customers(): User[] {
    return this.auth.getCustomers();
  }

  /**
   * Formatea la dirección del cliente para la tabla.
   * @param user Usuario cliente.
   * @returns Dirección o guión si está vacía.
   * @usageNotes Mostrado en la columna de dirección de despacho.
   */
  getAddress(user: User): string {
    return user.address?.trim() ? user.address : '—';
  }
}
