// ─── localStorage helpers ─────────────────────────────────────────────────────
// Centralises all read/write/remove operations.
// Use these directly only in non-hook code (e.g. api.js interceptors).
// Inside components always prefer useLocalStorage hook from src/hooks/.

import { LOCAL_STORAGE_KEYS } from "./constants";

// ── Generic wrappers ──────────────────────────────────────────────────────────

export function getItem(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`storage.setItem failed for key "${key}":`, err);
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`storage.removeItem failed for key "${key}":`, err);
  }
}

export function clearAll() {
  try {
    localStorage.clear();
  } catch (err) {
    console.error("storage.clearAll failed:", err);
  }
}

// ── Domain-specific helpers ───────────────────────────────────────────────────

/**
 * Returns the stored user object or null.
 * Used by api.js to attach userId to request headers in the future.
 */
export function getStoredUser() {
  return getItem(LOCAL_STORAGE_KEYS.USER);
}

export function setStoredUser(user) {
  setItem(LOCAL_STORAGE_KEYS.USER, user);
}

export function removeStoredUser() {
  removeItem(LOCAL_STORAGE_KEYS.USER);
}

/**
 * Returns the logged-in user's ID without importing AuthContext.
 * Useful inside api.js Axios interceptors or service files.
 */
export function getStoredUserId() {
  const user = getStoredUser();
  return user?.id ?? null;
}

// ── Recent searches ───────────────────────────────────────────────────────────

const MAX_RECENT_SEARCHES = 5;

export function getRecentSearches() {
  const stored = getItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES);
  return Array.isArray(stored) ? stored : [];
}

export function addRecentSearch(term) {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearches();

  const existing = getRecentSearches().filter(
    (entry) => entry.toLowerCase() !== trimmed.toLowerCase()
  );
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT_SEARCHES);
  setItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES, updated);
  return updated;
}

export function clearRecentSearches() {
  removeItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES);
}