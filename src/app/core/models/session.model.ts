import { UserRole } from './user.model';

/**
 * Sesión activa del usuario autenticado.
 * @usageNotes Persistida en `sessionStorage` bajo `STORAGE_KEYS.session`.
 */
export interface Session {
  userId: string;
  username: string;
  role: UserRole;
  fullName: string;
}
