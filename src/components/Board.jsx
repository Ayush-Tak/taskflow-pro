import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useBoard } from "../contexts/BoardContext";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import { createBoardHandlers } from "../handlers/boardHandlers";
import List from "./List";
import Card from "./Card";
import { ThemeToggleButton } from "./ThemeToggleButton";


/**
 * Main Board Component
 * The top-level component that renders the entire Trello board
 * Manages the board layout, drag-and-drop context, and list creation
 */
const Board = () => {
  // Get board data and dispatch function from context
  const { boardData, dispatch } = useBoard();

  // Initialize drag-and-drop functionality with custom hook
  const { sensors, activeItem, onDragStart, onDragEnd, onDragCancel } = useBoardDragAndDrop(boardData, dispatch);

  // Local state for managing "Add List" form
  const [isAddingList, setIsAddingList] = useState(false);     // Toggle for showing add list form
  const [newListTitle, setNewListTitle] = useState("");        // Input value for new list title

  // Get configured handlers for board actions
  const { handleAddList, handleCancelListAdd } = createBoardHandlers(dispatch);

  return (
    // DndContext provides drag-and-drop functionality to all child components
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {/* Main board container */}
      <div className="relative h-screen bg-background text-foreground">

        {/* Fixed header bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-secondary/30 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between h-full px-6">
            <h1 className="text-xl font-bold text-primary">Trello Clone</h1>
            <ThemeToggleButton />
          </div>
        </div>

        {/* Scrollable board content area */}
        <div className="pt-16 h-full w-full overflow-x-auto board-container">
          <div className="flex items-start p-6 space-x-6 min-w-max">

            {/* Sortable context for list reordering */}
            <SortableContext items={boardData.lists.map(list => list.id)} strategy={horizontalListSortingStrategy}>
              {/* Render each list */}
              {boardData.lists.map((list) => (
                <List key={list.id} list={list} />
              ))}
            </SortableContext>

            {/* Add List Section - shows either form or button */}
            {isAddingList ? (
              // Add List Form
              <form
                onSubmit={handleAddList(newListTitle, setNewListTitle, setIsAddingList)}
                className="w-72 flex-shrink-0 p-4 bg-secondary border-2 border-dashed border-primary/50 rounded-lg space-y-2 shadow-lg"
              >
                <input
                  type="text"
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  autoFocus
                  className="w-full p-3 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors">
                    Add List
                  </button>
                  <button type="button" onClick={handleCancelListAdd(setNewListTitle, setIsAddingList)} className="w-12 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                    ❌
                  </button>
                </div>
              </form>
            ) : (
              // Add List Button
              <div
                onClick={() => setIsAddingList(true)}
                className="w-72 flex-shrink-0 p-4 bg-secondary/50 border-2 border-dashed border-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 hover:border-primary/50 transition-all duration-200 group"
              >
                <span className="font-bold text-muted-foreground group-hover:text-primary transition-colors">Add another list +</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay - shows dragged item while dragging */}
      <DragOverlay>
        {/* Show dragged card */}
        {activeItem?.type === "Card" ? (
          <Card
            card={activeItem.data}
            wrapperClassName="transform rotate-3 shadow-2xl border-2 border-primary/50 drag-overlay"
          />
        ) : null}

        {/* Show dragged list */}
        {activeItem?.type === "List" ? (
          <div className="w-72 h-full opacity-90 drag-overlay">
            <List list={activeItem.data} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;