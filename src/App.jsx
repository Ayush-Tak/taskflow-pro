// React and style import statements
import "./App.css";
import React from "react";

// Component import
import Board from "./components/Board";

// Context import
import { BoardProvider } from "./contexts/BoardContext";
import { ThemeProvider } from "./contexts/ThemeContext";



function App() {


  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="trello-clone-theme">
        <BoardProvider>
          <Board />
        </BoardProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
