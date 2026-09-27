export type UserRole = 'student' | 'instructor';

export interface User {
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}
