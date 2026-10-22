/**
 * The photos-API login token, kept in localStorage under one key.
 * Every access is wrapped in try/catch: private windows and blocked
 * site data can make localStorage throw.
 */

export const TOKEN_KEY = "dulhaniyaa.photos.token";

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session lasts until the tab is closed or reloaded.
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}
