import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * Theme Toggle Button Component
 * Provides a visual toggle button for switching between light and dark themes
 * Shows appropriate icon based on current theme with hover tooltip
 *
 * @returns {JSX.Element} Theme toggle button with tooltip
 */
export const ThemeToggleButton = () => {
  // Get current theme and setter from theme context
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group">
      {/* Toggle button - switches between light and dark themes */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-3 rounded-full bg-secondary border-2 border-border text-secondary-foreground hover:bg-secondary/80 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-md hover:shadow-lg group"
      >
        {/* Icon changes based on current theme */}
        {theme === "dark" ? (
          <Sun size={20} className="text-primary group-hover:text-primary/80 transition-colors" />
        ) : (
          <Moon size={20} className="text-primary group-hover:text-primary/80 transition-colors" />
        )}
      </button>

      {/* Hover tooltip - shows what clicking will do */}
      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </div>
    </div>
  );
};