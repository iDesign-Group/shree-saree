const TOKEN_KEY = 'ss_admin_token';

/** Save JWT token to localStorage */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Get JWT token from localStorage */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/** Remove JWT token (logout) */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Check if user is logged in */
export function isLoggedIn(): boolean {
  return !!getToken();
}
