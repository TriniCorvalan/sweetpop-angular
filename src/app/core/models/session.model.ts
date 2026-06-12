import { UserRole } from './user.model';

export interface Session {
  userId: string;
  username: string;
  role: UserRole;
  fullName: string;
}
