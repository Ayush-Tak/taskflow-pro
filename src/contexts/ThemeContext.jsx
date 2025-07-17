import { createContext, useContext, useEffect, useState } from "react";

/**
 * Theme Context
 * Manages global theme state for the application
 * Supports light, dark, and system themes with localStorage persistence
 */

/**
 * Theme Provider Context
 * React context for theme management
 * Provides theme value and setter function to consuming components
 */
const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
});

/**
 * Theme Provider Component
 * Provides theme state and management to all child components
 * Automatically applies theme classes to document root
 * Persists theme preference to localStorage
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with theme context
 * @param {string} props.defaultTheme - Default theme to use ("light" | "dark" | "system")
 * @param {string} props.storageKey - localStorage key for theme persistence
 * @returns {JSX.Element} Provider component
 */
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "trello-theme" }) {
  // Initialize theme state from localStorage or default
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  // Apply theme classes to document root whenever theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Handle system theme by detecting user preference
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    // Apply the selected theme
    root.classList.add(theme);
  }, [theme]);

  // Context value with theme state and setter
  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * useTheme Hook
 * Custom hook to access theme context
 * Provides current theme and setTheme function to consuming components
 *
 * @returns {Object} Context value containing theme and setTheme
 * @throws {Error} If used outside of ThemeProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};