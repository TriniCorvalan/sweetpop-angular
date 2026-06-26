import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { Session } from '../models/session.model';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

/**
 * Resultado de un intento de inicio de sesión.
 * @usageNotes Consumido por el componente Login para mostrar mensajes y redirigir.
 */
export interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

/**
 * Usuario enriquecido con el rol activo de la sesión.
 * @usageNotes Retornado por {@link AuthService.getCurrentUser}.
 */
export interface CurrentUser extends User {
  sessionRole: UserRole;
}

/**
 * Servicio central de autenticación y gestión de usuarios.
 * @usageNotes Inyectable global. Gestiona `localStorage` (usuarios) y `sessionStorage` (sesión).
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly storage: StorageService) {}

  /**
   * Crea el usuario administrador precargado si aún no existe.
   * @returns void
   * @usageNotes Ejecutado en el `APP_INITIALIZER` al arrancar la aplicación.
   */
  ensureAdminUser(): void {
    const users = this.getUsers();
    const adminExists = users.some((user) => user.role === 'admin');

    if (!adminExists) {
      users.push({
        id: 'admin-1',
        username: 'admin',
        email: 'admin@sweetpop.cl',
        password: 'Admin123',
        role: 'admin',
        fullName: 'Administrador SweetPop',
        birthdate: '',
        address: '',
        signupDate: new Date().toLocaleString(),
      });
      this.saveUsers(users);
    }
  }

  /**
   * Obtiene todos los usuarios registrados.
   * @returns Lista de usuarios desde localStorage.
   * @usageNotes Base para registro, login y listado de clientes (admin).
   */
  getUsers(): User[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.users, []);
  }

  /**
   * Persiste la lista completa de usuarios.
   * @param users Usuarios a guardar.
   * @returns void
   * @usageNotes Sobrescribe el array completo en `STORAGE_KEYS.users`.
   */
  saveUsers(users: User[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.users, users);
  }

  /**
   * Busca un usuario por nickname.
   * @param username Nickname a buscar (sin distinguir mayúsculas).
   * @returns Usuario encontrado o `undefined`.
   * @usageNotes Usado en registro para evitar duplicados.
   */
  findUserByUsername(username: string): User | undefined {
    const normalized = username.trim().toLowerCase();
    return this.getUsers().find((user) => user.username.toLowerCase() === normalized);
  }

  /**
   * Busca un usuario por correo electrónico.
   * @param email Correo a buscar.
   * @returns Usuario encontrado o `undefined`.
   * @usageNotes Usado en registro y recuperación de contraseña.
   */
  findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.getUsers().find((user) => user.email.toLowerCase() === normalized);
  }

  /**
   * Busca un usuario por id interno.
   * @param userId Identificador del usuario.
   * @returns Usuario encontrado o `undefined`.
   * @usageNotes Usado en perfil y resolución de sesión.
   */
  findUserById(userId: string): User | undefined {
    return this.getUsers().find((user) => user.id === userId);
  }

  /**
   * Obtiene usuarios con rol client (`user`).
   * @returns Clientes registrados.
   * @usageNotes Consumido por la página Customers (admin).
   */
  getCustomers(): User[] {
    return this.getUsers().filter((user) => user.role === 'user');
  }

  /**
   * Obtiene la sesión activa desde sessionStorage.
   * @returns Sesión o `null` si no hay login.
   * @usageNotes Usado por guards y Header para construir navegación.
   */
  getSession(): Session | null {
    return this.storage.readJson(sessionStorage, STORAGE_KEYS.session, null);
  }

  /**
   * Guarda la sesión activa en sessionStorage.
   * @param session Datos de sesión a persistir.
   * @returns void
   * @usageNotes Llamado tras un login exitoso.
   */
  setSession(session: Session): void {
    this.storage.writeJson(sessionStorage, STORAGE_KEYS.session, session);
  }

  /**
   * Elimina la sesión activa de sessionStorage.
   * @returns void
   * @usageNotes Llamado en logout o cuando la sesión deja de ser válida.
   */
  clearSession(): void {
    this.storage.removeItem(sessionStorage, STORAGE_KEYS.session);
  }

  /**
   * Valida credenciales y crea sesión si son correctas.
   * @param usernameOrEmail Nickname o correo del usuario.
   * @param password Contraseña en texto plano.
   * @returns Resultado con mensaje y usuario autenticado si fue exitoso.
   * @usageNotes Invocado desde el formulario de Login.
   */
  login(usernameOrEmail: string, password: string): LoginResult {
    const credential = usernameOrEmail.trim();
    const user = this.getUsers().find(
      (item) =>
        item.username.toLowerCase() === credential.toLowerCase() ||
        item.email.toLowerCase() === credential.toLowerCase(),
    );

    if (!user) {
      return { success: false, message: 'Usuario o correo no encontrado.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    this.setSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    });

    return { success: true, message: 'Inicio de sesión exitoso.', user };
  }

  /**
   * Cierra sesión y elimina el borrador de caja.
   * @returns void
   * @usageNotes Invocado desde Logout y enlaces de cerrar sesión.
   */
  logout(): void {
    this.clearSession();
    this.storage.removeItem(sessionStorage, STORAGE_KEYS.boxDraft);
  }

  /**
   * Indica si existe una sesión activa.
   * @returns `true` si hay sesión en sessionStorage.
   * @usageNotes Usado antes de personalizar cajas o acceder al carrito.
   */
  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Comprueba si el usuario en sesión tiene el rol indicado.
   * @param role Rol a verificar (`admin` o `user`).
   * @returns `true` si el rol coincide.
   * @usageNotes Usado en BoxCatalogCards y BoxDraftService.
   */
  hasRole(role: UserRole): boolean {
    const session = this.getSession();
    return session !== null && session.role === role;
  }

  /**
   * Combina sesión con el usuario completo de localStorage.
   * @returns Usuario enriquecido o `null` si la sesión no es válida.
   * @usageNotes Consumido por Profile para cargar datos de cuenta.
   */
  getCurrentUser(): CurrentUser | null {
    const session = this.getSession();
    if (!session) {
      return null;
    }

    const user = this.findUserById(session.userId);
    if (!user) {
      this.clearSession();
      return null;
    }

    return {
      ...user,
      sessionRole: session.role,
    };
  }

  /**
   * Actualiza campos parciales de un usuario existente.
   * @param userId Id del usuario a modificar.
   * @param updates Campos a sobrescribir.
   * @returns `false` si el usuario no existe.
   * @usageNotes Usado en Profile para actualizar la dirección de despacho.
   */
  updateUser(userId: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      return false;
    }

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return true;
  }
}
