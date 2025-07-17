// React and style import statements
import "./App.css";
import React from "react";

// Component import
import Board from "./components/Board";

// Context import
import { BoardProvider } from "./contexts/BoardContext";
import { ThemeProvider } from "./contexts/ThemeContext";

/**
 * App Component
 * Root component of the Trello clone application
 * Sets up the provider hierarchy for theme and board state management
 *
 * Provider hierarchy:
 * 1. ThemeProvider - manages light/dark theme state
 * 2. BoardProvider - manages board data and operations
 * 3. Board - main board component with lists and cards
 *
 * @returns {JSX.Element} Root application component
 */
function App() {
  return (
    <>
      {/* Theme provider - manages global theme state */}
      <ThemeProvider defaultTheme="dark" storageKey="trello-clone-theme">
        {/* Board provider - manages board data and operations */}
        <BoardProvider>
          {/* Main board component */}
          <Board />
        </BoardProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
