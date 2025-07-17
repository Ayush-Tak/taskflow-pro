import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Custom hook for managing card-level drag and drop functionality
 * Makes cards sortable within lists and draggable between lists
 *
 * @param {string} cardId - Unique identifier for the card
 * @returns {Object} DND configuration object with refs, styles, and drag state
 */
export const useCardDragAndDrop = (cardId) => {
  // Make card sortable (can be reordered and moved between lists)
  const {
    attributes,     // Accessibility attributes for screen readers
    listeners,      // Event listeners for drag interactions
    setNodeRef,     // Ref to attach to the draggable element
    transform,      // Transform values for drag animation
    transition,     // Transition values for smooth animation
    isDragging,     // Boolean indicating if this card is being dragged
  } = useSortable({
    id: cardId,
  });

  // CSS transform string for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return {
    attributes,     // Accessibility attributes
    listeners,      // Drag event listeners
    setNodeRef,     // Ref for the draggable element
    style,          // CSS styles for drag animation
    isDragging,     // Drag state indicator
  };
};
