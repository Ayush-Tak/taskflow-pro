import { useState } from "react";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { handleDragStart, handleDragEnd, handleDragCancel } from "../handlers/boardDNDHandlers";

/**
 * Custom hook for managing board-level drag and drop functionality
 * Handles the entire board DND state including active item tracking and sensor configuration
 *
 * @param {Array} boardData - Array of lists with cards for drag operations
 * @param {Function} dispatch - Redux-like dispatch function for state updates
 * @returns {Object} DND configuration object with sensors, state, and handlers
 */
export const useBoardDragAndDrop = (boardData, dispatch) => {
  // Track the currently dragged item (list or card) with its type and data
  const [activeItem, setActiveItem] = useState(null);

  // Configure drag sensors for desktop use
  const sensors = useSensors(
    useSensor(PointerSensor,{
      activationConstraint: {
        delay: 210,
        tolerance: 5, // 5px tolerance for drag (mobile friendly)
      },
    })
  );

  // Drag event handlers - these wrap the actual business logic handlers
  // and provide the necessary parameters from the hook's scope

  /**
   * Handles drag start - identifies what's being dragged and sets active item
   */
  const onDragStart = (event) =>
    handleDragStart(event, boardData, setActiveItem);

  /**
   * Handles drag end - processes the drop and updates board state
   */
  const onDragEnd = (event) =>
    handleDragEnd(event, boardData, setActiveItem, dispatch, activeItem);

  /**
   * Handles drag cancel - cleans up drag state when drag is cancelled
   */
  const onDragCancel = () => handleDragCancel(setActiveItem);

  // Return all DND configuration needed by the Board component
  return {
    sensors,        // DND sensors configuration
    activeItem,     // Currently dragged item (for DragOverlay)
    onDragStart,    // Drag start handler
    onDragEnd,      // Drag end handler
    onDragCancel,   // Drag cancel handler
  };
};
