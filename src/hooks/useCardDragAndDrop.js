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
    // Enhanced transition for smoother mobile dragging
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  // CSS transform string for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return {
    attributes: {
      ...attributes,
      'data-testid': 'drag-handle',
    },
    listeners: {
      ...listeners,
      // Enhanced touch handling
      onTouchStart: (e) => {
        e.stopPropagation();
        if (listeners?.onTouchStart) {
          listeners.onTouchStart(e);
        }
      },
    },     // Enhanced drag event listeners
    setNodeRef,     // Ref for the draggable element
    style,          // CSS styles for drag animation
    isDragging,     // Drag state indicator
  };
};
