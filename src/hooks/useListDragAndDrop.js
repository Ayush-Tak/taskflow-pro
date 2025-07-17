import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Custom hook for managing list-level drag and drop functionality
 * Combines droppable (can receive cards) and sortable (can be reordered) behaviors
 *
 * @param {string} listId - Unique identifier for the list
 * @returns {Object} DND configuration object with refs, styles, and drag state
 */
export const useListDragAndDrop = (listId) => {
  // Make list droppable (can receive cards dropped onto it)
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: listId });

  // Make list sortable (can be reordered among other lists)
  const {
    attributes,     // Accessibility attributes for screen readers
    listeners,      // Event listeners for drag interactions
    setNodeRef: setSortableNodeRef,
    transform,      // Transform values for drag animation
    transition,     // Transition values for smooth animation
    isDragging,     // Boolean indicating if this list is being dragged
  } = useSortable({ id: listId });

  // CSS transform string for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /**
   * Combines droppable and sortable refs into one
   * Both behaviors need to be applied to the same DOM element
   */
  const combineRefs = (node) => {
    setDroppableNodeRef(node);
    setSortableNodeRef(node);
  };

  return {
    combineRefs,    // Combined ref for both droppable and sortable
    style,          // CSS styles for drag animation
    attributes,     // Accessibility attributes
    listeners,      // Drag event listeners
    isDragging,     // Drag state indicator
  };
};
