import { STORAGE_KEYS } from "./constants";

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function logout() {
  clearToken();
  clearUser();
}
