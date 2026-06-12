import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-customers',
  imports: [RouterLink],
  templateUrl: './customers.html',
})
export class Customers {
  private readonly auth = inject(AuthService);

  get customers(): User[] {
    return this.auth.getCustomers();
  }

  getAddress(user: User): string {
    return user.address?.trim() ? user.address : '—';
  }
}
