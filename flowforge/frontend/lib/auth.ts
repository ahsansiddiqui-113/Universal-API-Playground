import { apiRequest } from './http';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: 'FREE' | 'PRO';
  aiCredits: number;
};

type AuthResponse = {
  user: AuthUser;
};

export function getCurrentUser() {
  return apiRequest<AuthUser>('/auth/me');
}

export function signup(payload: { email: string; password: string; name?: string }) {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginWithGoogle(idToken: string, name?: string) {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, name }),
  });
}

export function logout() {
  return apiRequest<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
  });
}
