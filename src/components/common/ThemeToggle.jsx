import { useThemeStore } from "@/store/themeStore";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const resolvedTheme =
    theme ??
    (typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme")
      : null) ??
    "dark";

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? "theme-toggle--dark" : "theme-toggle--light"}`}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__icon theme-toggle__icon--sun">🌞</span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">🌙</span>
        <span className="theme-toggle__thumb" aria-hidden="true" />
      </span>
    </button>
  );
};

export default ThemeToggle;
