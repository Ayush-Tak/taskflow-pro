import { useState, useMemo, useRef, useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useBoard } from "../contexts/BoardContext";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import { createBoardHandlers } from "../handlers/boardHandlers";
import { createZoomHandlers } from "../handlers/zoomHandlers";
import List from "./List";
import Card from "./Card";
import { ThemeToggleButton } from "./ThemeToggleButton";
import LabelSidebar from "./LabelSidebar";
import FloatingScrollbar from "./FloatingScrollbar";

/**
 * Floating Zoom Controls Component
 * Provides zoom in/out/reset buttons for mobile devices
 */
const FloatingZoomControls = () => {
  const [showZoomControls, setShowZoomControls] = useState(false);
  const { handleZoomIn, handleZoomOut, handleResetZoom } = createZoomHandlers();

  useEffect(() => {
    const checkMobile = () => {
      setShowZoomControls(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!showZoomControls) return null;

  return (
    <div className="fixed bottom-20 right-4 flex flex-col space-y-2 z-50 zoom-controls">
      <button
        onClick={handleZoomIn}
        className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-xl font-bold active:scale-95"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-xl font-bold active:scale-95"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={handleResetZoom}
        className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-xs font-medium active:scale-95"
        aria-label="Reset zoom"
      >
        1×
      </button>
    </div>
  );
};
/**
 * Main Board Component
 * The top-level component that renders the TaskFlow Pro board
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
  const [isLabelSidebarOpen, setIsLabelSidebarOpen] = useState(false); // Toggle for label sidebar

  // Ref for the board container to sync with floating scrollbar
  const boardContainerRef = useRef(null);

  // Get configured handlers for board actions
  const { handleAddList, handleCancelListAdd } = createBoardHandlers(dispatch);

  // Filter lists based on active label filters
  const filteredBoardData = useMemo(() => {
    if (!boardData.activeFilters || boardData.activeFilters.length === 0) {
      return boardData;
    }

    const result = {
      ...boardData,
      lists: boardData.lists.map(list => ({
        ...list,
        cards: list.cards.filter(card => {
          const hasMatchingLabel = boardData.activeFilters.some(filterId =>
            card.labelIds && card.labelIds.includes(filterId)
          );
          return hasMatchingLabel;
        })
      }))
    };

    return result;
  }, [boardData]);

  return (
    // DndContext provides drag-and-drop functionality to all child components
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {/* Main board container */}
      <div className="min-h-screen bg-background text-foreground">

        {/* Fixed header bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border z-30 shadow-sm">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-3">
              {/* TaskFlow Pro logo/icon */}
                <img src="/taskflow-icon.svg" alt="TaskFlow Pro" className="w-6 h-6" />
              <h1 className="text-xl font-bold text-primary">TaskFlow Pro</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLabelSidebarOpen(true)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 relative ${
                  boardData.activeFilters && boardData.activeFilters.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                title="Manage Labels"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Labels</span>
                {boardData.activeFilters && boardData.activeFilters.length > 0 && (
                  <span className="bg-primary-foreground text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {boardData.activeFilters.length}
                  </span>
                )}
              </button>
              <ThemeToggleButton />
            </div>
          </div>
        </div>

        {/* Scrollable board content area */}
        <div ref={boardContainerRef} className="pt-24 pb-6 h-full w-full overflow-x-auto board-container board-scroll-container touch-optimized">
          <div className="px-6">
            {/* Active Filter Indicator */}
            {boardData.activeFilters && boardData.activeFilters.length > 0 && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    Filtering by {boardData.activeFilters.length} label{boardData.activeFilters.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setIsLabelSidebarOpen(true)}
                    className="text-xs text-primary hover:text-primary/80 underline"
                  >
                    Manage filters
                  </button>
                </div>
              </div>
            )}

            {/* Board Lists */}
            <div className="flex items-start space-x-6 min-w-max">
              {/* Sortable context for list reordering */}
              <SortableContext items={filteredBoardData.lists.map(list => list.id)} strategy={horizontalListSortingStrategy}>
                {/* Render each list with filtered data */}
                {filteredBoardData.lists.map((list) => (
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

      {/* Label Sidebar */}
      <LabelSidebar
        isOpen={isLabelSidebarOpen}
        onClose={() => setIsLabelSidebarOpen(false)}
      />

      {/* Floating Scrollbar for Mobile */}
      <FloatingScrollbar targetElementRef={boardContainerRef} />

      {/* Floating Zoom Controls for Mobile */}
      <FloatingZoomControls />
    </DndContext>
  );
};

export default Board;