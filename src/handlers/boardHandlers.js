import { v4 as uuidv4 } from "uuid";

/**
 * Board-level action handlers
 * Contains handlers for board operations like adding lists
 * These are factory functions that create handlers with proper closure over state setters
 */

/**
 * Creates board-related action handlers
 * Uses closure to capture dispatch function and return configured handlers
 *
 * @param {Function} dispatch - Redux-like dispatch function for state updates
 * @returns {Object} Object containing all board action handlers
 */
export const createBoardHandlers = (dispatch) => {
  /**
   * Handles adding a new list to the board
   * Validates input, creates new list with UUID, and updates board state
   *
   * @param {string} newListTitle - Title for the new list
   * @param {Function} setNewListTitle - State setter for list title input
   * @param {Function} setIsAddingList - State setter for add list mode
   * @returns {Function} Form submit handler
   */
  const handleAddList = (newListTitle, setNewListTitle, setIsAddingList) => (e) => {
    e.preventDefault();

    // Validate input - don't create empty lists
    if (newListTitle.trim() === "") return;

    // Create new list with unique ID and empty cards array
    dispatch({
      type: "ADD_LIST",
      payload: {
        id: uuidv4(),
        title: newListTitle,
        cards: []
      },
    });

    // Reset form state
    setNewListTitle("");
    setIsAddingList(false);
  };

  /**
   * Handles cancelling the add list operation
   * Resets form state and exits add list mode
   *
   * @param {Function} setNewListTitle - State setter for list title input
   * @param {Function} setIsAddingList - State setter for add list mode
   * @returns {Function} Cancel handler
   */
  const handleCancelListAdd = (setNewListTitle, setIsAddingList) => () => {
    // Reset form state
    setNewListTitle("");
    setIsAddingList(false);
  };

  return {
    handleAddList,        // Handler for adding new lists
    handleCancelListAdd,  // Handler for cancelling add list
  };
};
