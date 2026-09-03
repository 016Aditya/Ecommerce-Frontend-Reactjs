import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "theme-preference";
// First-time visitors (no stored preference) get dark by default — see
// the matching inline script in index.html, which must stay in sync with
// this value to avoid a flash of the wrong theme on first paint.
const DEFAULT_THEME = "dark";

/** Read the theme synchronously from localStorage (runs before React renders). */
const getStoredTheme = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Zustand persist wraps the value: { state: { theme: '...' }, version: 0 }
      return parsed?.state?.theme ?? null;
    }
  } catch {
    // ignore JSON/storage errors
  }
  return null;
};

/** Apply data-theme to <html> immediately — call this as early as possible. */
export const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0f1115" : "#f4f6f8");
};

/**
 * Call once — as early as possible (top of main.jsx, before ReactDOM.render).
 * Reads the persisted preference and applies it synchronously so there is
 * never a flash of the wrong theme on page load.
 */
export const initThemeEarly = () => {
  const stored = getStoredTheme();
  applyTheme(stored ?? DEFAULT_THEME);
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: getStoredTheme() ?? DEFAULT_THEME,

      get resolvedTheme() {
        return get().theme ?? DEFAULT_THEME;
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      /** Re-apply stored theme — call from ThemeProvider on mount. */
      initTheme: () => {
        applyTheme(get().theme ?? DEFAULT_THEME);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
