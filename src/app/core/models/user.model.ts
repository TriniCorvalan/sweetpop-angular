/** Rol de acceso del usuario en la aplicación. @usageNotes Valores: `admin` o `user`. */
export type UserRole = 'admin' | 'user';

/**
 * Usuario registrado con credenciales y datos de perfil.
 * @usageNotes Persistido en `localStorage` bajo `STORAGE_KEYS.users`.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  birthdate: string;
  address: string;
  signupDate: string;
}
