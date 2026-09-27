import type { User } from '../types/auth';

const STORAGE_KEY = 'quantumlearn_auth_user';

export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === 'object' && parsed.email && parsed.role) {
      return parsed as User;
    }
  } catch (err) {
    console.error('Error reading auth from localStorage:', err);
  }
  return null;
};

export const setCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving auth to localStorage:', err);
  }
};

export const removeCurrentUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error removing auth from localStorage:', err);
  }
};
