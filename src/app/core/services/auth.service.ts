import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { Session } from '../models/session.model';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

export interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

export interface CurrentUser extends User {
  sessionRole: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly storage: StorageService) {}

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

  getUsers(): User[] {
    return this.storage.readJson(localStorage, STORAGE_KEYS.users, []);
  }

  saveUsers(users: User[]): void {
    this.storage.writeJson(localStorage, STORAGE_KEYS.users, users);
  }

  findUserByUsername(username: string): User | undefined {
    const normalized = username.trim().toLowerCase();
    return this.getUsers().find((user) => user.username.toLowerCase() === normalized);
  }

  findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.getUsers().find((user) => user.email.toLowerCase() === normalized);
  }

  findUserById(userId: string): User | undefined {
    return this.getUsers().find((user) => user.id === userId);
  }

  getCustomers(): User[] {
    return this.getUsers().filter((user) => user.role === 'user');
  }

  getSession(): Session | null {
    return this.storage.readJson(sessionStorage, STORAGE_KEYS.session, null);
  }

  setSession(session: Session): void {
    this.storage.writeJson(sessionStorage, STORAGE_KEYS.session, session);
  }

  clearSession(): void {
    this.storage.removeItem(sessionStorage, STORAGE_KEYS.session);
  }

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

  logout(): void {
    this.clearSession();
    this.storage.removeItem(sessionStorage, STORAGE_KEYS.boxDraft);
  }

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  hasRole(role: UserRole): boolean {
    const session = this.getSession();
    return session !== null && session.role === role;
  }

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
