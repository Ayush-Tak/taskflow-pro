/**
 * Board-level drag and drop handlers
 * Contains the core business logic for dragging lists and cards on the board
 * These are pure functions that handle the drag events and determine what actions to take
 */

/**
 * Handles the start of a drag operation
 * Identifies what type of item is being dragged (list or card) and sets up the active item
 * Identifies what type of item is being dragged (list or card) and sets up the active item
 *
 * @param {Object} event - DND event object containing active item info
 * @param {Array} boardData - Current board state with lists and cards
 * @param {Function} setActiveItem - State setter for the currently dragged item
 */
export const handleDragStart = (event, boardData, setActiveItem) => {
    const { active } = event;
    const { id } = active;

    // Check if dragged item is a list (lists are top-level items in boardData)
    const isList = boardData.lists.some((list) => list.id === id);
    if (isList) {
      // Find the list being dragged and set it as active
      const list = boardData.lists.find((list) => list.id === id);
      setActiveItem({ type: "List", data: list });
      return;
    }

    // If not a list, check if it's a card (nested within lists)
    let card = null;
    let listID = null;

    // Search through all lists to find the card
    boardData.lists.forEach((list) => {
      const found = list.cards.find((c) => c.id === id);
      if (found) {
        card = found;
        listID = list.id;
      }
    });

    // If card found, set it as active with its parent list ID
    if (card) {
      setActiveItem({ type: "Card", data: card, listID });
    }
  };

/**
 * Handles the end of a drag operation
 * Processes the drop location and dispatches appropriate actions for list/card movement
 * Also cleans up drag state and visual feedback
 *
 * @param {Object} event - DND event object containing active and over items
 * @param {Array} boardData.lists - Current board state
 * @param {Function} setActiveItem - State setter for active item
 * @param {Function} dispatch - Redux-like dispatch function for state updates
 * @param {Object} activeItem - Currently dragged item with type and data
 */
export const handleDragEnd = (event, boardData, setActiveItem, dispatch, activeItem) => {
    const { active, over } = event;

    // Clear active item regardless of drop success
    setActiveItem(null);

    // If no valid drop target, exit early
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropped on itself, no action needed
    if (activeId === overId) return;

    // Handle list reordering
    const isListDrag = activeItem?.type === "List";
    if (isListDrag) {
      // Find old and new positions in the lists array
      const oldIndex = boardData.lists.findIndex((list) => list.id === activeId);
      const newIndex = boardData.lists.findIndex((list) => list.id === overId);

      // Only dispatch if position actually changed
      if (oldIndex !== newIndex) {
        dispatch({
          type: "MOVE_LIST",
          payload: { sourceIndex: oldIndex, destinationIndex: newIndex },
        });
      }
      return;
    }

    // Handle card movement (within same list or between lists)
    // Find source list (where card came from)
    const sourceList = boardData.lists.find((list) =>
      list.cards.some((card) => card.id === activeId)
    );

    // Find destination list (where card is being dropped)
    // Can be dropped on list itself or on another card within a list
    const destList = boardData.lists.find(
      (list) =>
        list.id === overId || list.cards.some((card) => card.id === overId)
    );

    // If source or destination not found, exit
    if (!sourceList || !destList) return;

    // Check if dropped on another card (for positioning) or on list (end of list)
    const isDroppingOnCard = destList.cards.some((card) => card.id === overId);

    // Dispatch card movement action
    dispatch({
      type: "MOVE_CARD",
      payload: {
        cardId: activeId,
        sourceListId: sourceList.id,
        destListId: destList.id,
        overCardId: isDroppingOnCard ? overId : null, // null means drop at end
      },
    });
  };

/**
 * Handles drag operation cancellation
 * Cleans up drag state when drag is cancelled (e.g., ESC key or invalid drop)
 *
 * @param {Function} setActiveItem - State setter for active item
 */
export const handleDragCancel = (setActiveItem) => {
    // Clear active item
    setActiveItem(null);
  };